import http from "http";
import express from "express";
import rethinkdb from "rethinkdb";
import socketIO from "socket.io";
import { join } from "path";

const app = express();
const server = http.Server(app);
const io = socketIO(server);
const views = join(__dirname, "views");

export default async connection => {
  app.get("/", (req, res) => {
    return res.sendFile(views + "/index.html");
  });

  // database selection
  const db = rethinkdb.db(process.env.DB_NAME);
  // table selection
  const commentsTable = db.table(process.env.DB_TABLE_NAME);
  // onchange event
  const cursor = await commentsTable.changes().run(connection);

  const getComments = () =>
    new Promise(async (resolve, reject) => {
      const comments = [];
      const cursor = await commentsTable.run(connection);

      cursor.each(
        (err, message) => {
          if (err) {
            reject(err);
          }

          comments.push(message);
        },
        err => {
          if (err) {
            reject(err);
          }

          resolve(comments);
        }
      );
    });

  cursor.each(async (err, data) => {
    // data.new_val -> new value
    // data.old_val -> old value

    const comments = await getComments();
    io.sockets.emit("comments", comments);
  });

  io.on("connection", async client => {
    const comments = await getComments();
    client.emit("comments", comments);

    client.on("comments", body => {
      const { name, message } = body;

      commentsTable
        .insert({
          name,
          message,
          date: new Date()
        })
        .run(connection);
    });
  });

  return server;
};
