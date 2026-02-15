import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "./lib/db.js";
import { app, server } from "./lib/socket.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import aiMessageRoutes from "./routes/ai-message.route.js";
import groupRoutes from "./routes/group.route.js";

dotenv.config();
const PORT = process.env.PORT;
const CLIENT_URL = process.env.CLIENT_URL;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
	cors({
		origin: [
			CLIENT_URL,
		],
		credentials: true,
	})
);

app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/ai-message", aiMessageRoutes);
app.use("/api/group", groupRoutes);

server.listen(PORT, () => {
	console.log("App listening at port " , PORT);
	connectDB();
});
