import { Redis } from "ioredis";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";

import http from "http";
import express from "express";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const server = http.createServer(app);
const CLIENT_URL = process.env.CLIENT_URL;

console.log(process.env.REDIS_URL);

const redis = new Redis(process.env.REDIS_URL);

const pubClient = new Redis(process.env.REDIS_URL);

const subClient = pubClient.duplicate();

pubClient.on("error", (err) => console.error("REDIS ERROR", err));
subClient.on("error", (err) => console.error("REDIS ERROR", err));

const io = new Server(server, {
	cors: {
		origin: CLIENT_URL,
	},
	adapter: createAdapter(pubClient, subClient),
});

export const getRecieverSocketId = async (userId) => {
	return await redis.hget("online_users", userId);
};

io.on("connection", async (socket) => {
	console.log("A user connected", socket.id);
	const userId = socket.handshake.query.userId;

	if (userId) {
		await redis.hset("online_users", userId, socket.id);
	}

	const allUsers = await redis.hkeys("online_users");
	io.emit("onlineUsers", allUsers);

	socket.on("disconnect", async () => {
		console.log("A user disconnected", socket.id);
		if (userId) {
			await redis.hdel("online_users", userId);
		}

		const allUsers = await redis.hkeys("online_users");
		io.emit("onlineUsers", allUsers);
	}) ;
}) ;

export { app, io, server } ;
