import rethinkdb from "rethinkdb";

export default async connection => {
  try {
    let db = await rethinkdb
      .dbList()
      .contains(process.env.DB_NAME)
      .run(connection);

    if (!db) {
      rethinkdb.dbCreate(process.env.DB_NAME).run(connection);
      db = rethinkdb.db(process.env.DB_NAME);
      console.log("Chats database created");
      db.tableCreate(process.env.DB_TABLE_NAME).run(connection);
      console.log("messages table created successfully");
    }
  } catch (ex) {
    console.log(ex.message);
  }
};
