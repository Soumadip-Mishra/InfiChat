import {Server} from "socket.io";
import  http from "http";
import express from "express";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const server = http.createServer(app);
const CLIENT_URL = process.env.CLIENT_URL;

const io  = new Server(server,{
    cors :{
       origin: CLIENT_URL,
    },
})

const userSocketMap = {};

export const getRecieverSocketId = (userId) => {
    return userSocketMap[userId];
};

io.on("connection",(socket)=>{
    console.log("A user connected", socket.id);
    const userId = socket.handshake.query.userId;
    if (userId) userSocketMap [userId] = socket.id;

    io.emit("onlineUsers",Object.keys(userSocketMap));

    socket.on("disconnect",()=>{
        console.log("A user disconnected" , socket.id);
        delete userSocketMap [userId]
        io.emit("onlineUsers",Object.keys(userSocketMap));
    })
})

export {app,io,server}