import app from "./server";
import dbConnector from "./models/db";
import express from "express";
import { createServer } from "http";
// import { Server } from "socket.io";
// import { allSockets } from "./sockets/sockets";

const connectDb = dbConnector.connectToDb;

const httpServer = createServer(app);
// const io = new Server(httpServer, {
//   cors: {
//     origin: "*", // Allow requests from React app
//     methods: ["GET", "POST"],
//   },
// });

connectDb((err) => {
  if (!err) {
    console.log("connected to database");
    app.use(express.json());

    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
    const host = "0.0.0.0";

    app.listen(port, host, () => {
      console.log(`Server running on ${host}:${port}`);
      // allSockets(io);
    });
  } else {
    console.log("errr", err);
  }
});


