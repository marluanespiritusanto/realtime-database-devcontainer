import { DbSeed } from "./seeds";
import rethinkdb from "rethinkdb";
import createApplication from "./app";

rethinkdb
  .connect({ host: process.env.DB_HOST })
  .then(async connection => {
    await DbSeed(connection); // create default database and table
    const app = await createApplication(connection);

    app.listen(process.env.PORT, () => {
      console.log("Realtime database server running");
    });
  })
  .catch(console.log);
