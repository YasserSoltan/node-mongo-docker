## Node + Mongo (Dockerized)

Production-lean Node.js + Express + Mongoose API with Docker Compose, MongoDB, optional Mongo Express UI, and single-node replica set support for transactions in development and tests.


### Prerequisites

- Docker Desktop 4.x+
- Docker Compose V2 (bundled with Docker Desktop)
- Node.js 18+ if running locally without Docker (optional)


### Project Structure

```
src/
  app.js            # Express app wiring, routes, health
  index.js          # App entry: connects to Mongo and starts server
docker-compose.yml  # Services: app, mongo, (optional) mongo-express
Dockerfile          # Production image for the Node app
mongo-init/         # One-time init scripts for Mongo
  01-init-rs.js     # Initiates single-node replica set (rs0)
.env.production     # Environment for Docker (not committed)
```


### Environment Variables

Compose reads envs from two places:

- env_file: `.env.production` (secrets live here)
- environment: inline overrides in `docker-compose.yml`

Precedence: `environment` > `env_file` > Dockerfile `ENV`. Inside the app, `dotenv` loads `.env.${NODE_ENV}` but does not override existing values set by Docker.

Recommended `.env.production` (example):

```
JWT_SECRET=replace_me
MONGO_URI=mongodb://mongo:27017/prod_db?replicaSet=rs0
PORT=3000
```

Ensure `.env.production` is git-ignored.


### Run with Docker

1) Build and start

```
docker compose build
docker compose up -d
```

2) Verify services

- App health: `http://localhost:3000/health`
- Mongo Express (optional): `http://localhost:8081`

3) View logs

```
docker compose logs -f app
docker compose logs -f mongo
```

4) Stop

```
docker compose down
```


### MongoDB Replica Set (transactions in dev/test)

This setup runs MongoDB as a single-node replica set so multi-document transactions work during development and tests.

- Mongo starts with: `mongod --replSet rs0 --bind_ip_all`
- One-time init mounted at: `./mongo-init/01-init-rs.js`
- App connects with: `mongodb://mongo:27017/prod_db?replicaSet=rs0`

First start initializes the replica set automatically via the init script.

Recreate to re-init (destroys data):

```
docker compose down -v
docker compose up -d
```

Check status:

```
docker compose exec mongo mongosh --eval 'rs.status().ok'
```

If cross-container discovery issues occur, change the member host in `mongo-init/01-init-rs.js` to `"mongo:27017"`, then recreate with `down -v`.


### NPM Scripts (local or inside container)

From `package.json`:

```
npm run start   # NODE_ENV=production node src/index.js
npm run dev     # NODE_ENV=development nodemon src/index.js
npm run test    # NODE_ENV=test jest --runInBand
```

Run tests inside the app container:

```
docker compose exec app npm test
```


### Connection String

- Docker: `mongodb://mongo:27017/prod_db?replicaSet=rs0`
- Local (no Docker): `mongodb://localhost:27017/dev_db` (adjust as needed)


### Common Troubleshooting

- Healthcheck failing at `http://localhost:3000/health`
  - Check app logs: `docker compose logs -f app`
  - Ensure `PORT=3000` and the container exposes 3000

- Transactions throw "Transaction numbers are only allowed on a replica set member"
  - Ensure the connection string includes `?replicaSet=rs0`
  - Ensure init script ran; recreate with `docker compose down -v && docker compose up -d`

- Mongo connection timeout
  - Confirm the service name `mongo` matches your URI host
  - Verify port exposure `27017:27017`


### Security Notes

- Do not commit `.env.production`
- For real deployments, enable Mongo auth and use strong credentials
- If you enable Mongo Express in shared environments, use basic auth


### License

ISC
