// Initiate a single-node replica set for transactions in dev/test
// This runs automatically via /docker-entrypoint-initdb.d on first start
rs.initiate({
  _id: "rs0",
  members: [{ _id: 0, host: "localhost:27017" }],
});

