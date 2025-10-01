## Node + Mongo (Dockerized)

A Node.js + Express + Mongoose API, dockerized with MongoDB and optional Mongo Express UI. Supports transactions in dev/test via a single-node replica set.

### Prerequisites

- Docker Desktop 4.x+
- Node.js 18+ (optional, for local runs)

### Quick Start

1. **Build & Start**

   ```
   docker compose build
   docker compose up -d
   ```

2. **Check Services**

   - App: [http://localhost:3000/health](http://localhost:3000/health)
   - Mongo Express (optional): [http://localhost:8081](http://localhost:8081)

3. **Logs**

   ```
   docker compose logs -f app
   docker compose logs -f mongo
   ```

4. **Stop**
   ```
   docker compose down
   ```

### Environment Variables

Create `.env.production` (git-ignored):

```
JWT_SECRET=replace_me
MONGO_URI=mongodb://mongo:27017/prod_db?replicaSet=rs0
PORT=3000
```

### MongoDB Transactions

- Uses a single-node replica set for transactions.
- Recreate DB:
  ```
  docker compose down -v
  docker compose up -d
  ```

### NPM Scripts

```
npm run start   # Production
npm run dev     # Development
npm run test    # Tests
```

Run tests in container:

```
docker compose exec app npm test
```

### Connection Strings

- Docker: `mongodb://mongo:27017/prod_db?replicaSet=rs0`
- Local: `mongodb://localhost:27017/dev_db`

### API Documentation (Swagger)

- [View Swagger Docs](https://app.swaggerhub.com/apis-docs/wecode-edc/docker-node/1.0.0#/)