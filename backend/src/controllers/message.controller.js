import fs from "fs";
import cloudinary from "../lib/cloudinary.js";
import { getRecieverSocketId, io } from "../lib/socket.js";
import PrivateMessage from "../models/privateMessage.model.js";
import User from "../models/user.model.js";
import Group from "../models/group.model.js";
import GroupMessage from "../models/groupMessage.model.js";
import LastGroupMessage from "../models/lastGroupMessage.model.js";
import PrivateLastMessage from "../models/lastPrivateMessage.model.js";

export const usersSidebar = async (req, res) => {
	try {
		let sID = req.user._id;
		const users = await User.find({ _id: { $ne: sID } }).select(
			"-password"
		);
		const filteredUsers = await PrivateLastMessage.find({ currUserID: sID })
			.sort({ time: -1 })
			.select("targetUserID")
			.populate("targetUserID", "-password");
		const sortedUsers = [];
		filteredUsers.forEach((user) => {
			sortedUsers.push(user.targetUserID);
		});
		users.forEach((user) => {
			if (!sortedUsers.some((u) => u._id.equals(user._id))) {
				sortedUsers.push(user);
			}
		});
		res.status(200).json(sortedUsers);
	} catch (error) {
		console.log("Error in loading side users " + error);
		res.status(500).json({ message: "Internal Server Error" });
	}
};

export const getPrivateMessage = async (req, res) => {
	try {
		const { id: rID } = req.params;
		const sID = req.user._id;
		const messages = await PrivateMessage.find({
			$or: [
				{ senderID: sID, recieverID: rID },
				{ senderID: rID, recieverID: sID },
			],
		}).sort({ createdAt: 1 });
		res.status(200).json(messages);
	} catch (error) {
		console.log("Error in loading messages " + error);
		res.status(500).json({ message: "Internal Server Error" });
	}
};

export const sendPrivateMessage = async (req, res) => {
	try {
		const { id: rID } = req.params;
		const sID = req.user._id;
		const text = req.body.text;
		let finalImageURL = "";
        if (!text && !req.file) {
            res.status(400).json({ message: "Message cannot be empty" });
            return;
        }
        
		if (req.file) {
			const uploadRes = await cloudinary.uploader.upload(req.file.path, {
				folder: "chat-app/messages",
				transformation: [{ quality: "auto" }],
                 resource_type: "raw",
			});

			finalImageURL = uploadRes.secure_url;
			fs.unlinkSync(req.file.path);
		}

		const newMessage = new PrivateMessage({
			senderID: sID,
			recieverID: rID,
			text,
			image: finalImageURL,
		});

		await newMessage.save();
		await PrivateLastMessage.replaceOne(
			{ currUserID: sID, targetUserID: rID },
			{
				currUserID: sID,
				targetUserID: rID,
				time: new Date(newMessage.createdAt).toISOString(),
			},
			{ upsert: true }
		);
		await PrivateLastMessage.replaceOne(
			{ currUserID: rID, targetUserID: sID },
			{
				currUserID: rID,
				targetUserID: sID,
				time: new Date(newMessage.createdAt).toISOString(),
			},
			{ upsert: true }
		);

		const recieverSocketId = await getRecieverSocketId(rID);
		if (recieverSocketId) {
			io.to(recieverSocketId).emit("newMessage", {
				type: "user",
				message: newMessage,
			});
		}

		res.status(200).json(newMessage);
	} catch (error) {
		console.error("Error sending message:", error);
		res.status(500).json({
			message: "Internal Server Error at sending message",
		});
	}
};
export const getGroupMessage = async (req, res) => {
	try {
		const userID = req.user._id;
		const { id: groupID } = req.params;
		const group = await Group.findOne({ _id: groupID });
		if (!group) {
			res.status(400).json({ message: "Group not found" });
			return;
		}
		if (!group.members.includes(userID)) {
			res.status(400).json({ message: "Group not found" });
			return;
		}
		const messages = await GroupMessage.find({
			recieverID: groupID,
		})
			.sort({ createdAt: 1 })
			.populate("senderID", "-password");

		const joiningTime = req.user.groups.filter(
			(ele) => ele.groupID.toString() == groupID.toString()
		)[0].joinedAt;

		const messagesAfterJoining = messages.filter(
			(message) => message.createdAt > joiningTime
		);

		res.status(200).json(messagesAfterJoining);
	} catch (error) {
		console.log("Error in loading messages " + error);
		res.status(500).json({ message: "Internal Server Error" });
	}
};

export const sendGroupMessage = async (req, res) => {
	try {
		const userID = req.user._id;
		const { id: groupID } = req.params;
		const text = req.body.text;

		const group = await Group.findOne({ _id: groupID });
		if (!group) {
			res.status(400).json({ message: "Group not found" });
			return;
		}
		if (!group.members.includes(userID)) {
			res.status(400).json({ message: "Group not found" });
			return;
		}

		let finalImageURL = "";
		if (req.file) {
			const uploadRes = await cloudinary.uploader.upload(req.file.path, {
				folder: "chat-app/group-messages",
				transformation: [{ quality: "auto" }],
			});

			finalImageURL = uploadRes.secure_url;
			fs.unlinkSync(req.file.path);
		}
		const message = new GroupMessage({
			senderID: userID,
			recieverID: groupID,
			text,
			image: finalImageURL,
		});
		await message.save();
		message.senderID = req.user;

		await LastGroupMessage.findOneAndUpdate(
			{ groupID },
			{ groupID },
			{ upsert: true }
		);

		const members = group.members;
        
		await Promise.all(members.forEach(async(member) => {
			if (member.toString() !== req.user._id.toString()) {
				const recieverSocketId = await getRecieverSocketId(member);
				if (recieverSocketId) {
					io.to(recieverSocketId).emit("newMessage", {
						type: "group",
						message: message,
					});
				}
			}
		}));
		message.senderID = req.user;
		res.status(200).json(message);
	} catch (error) {
		console.log("Error in sending message " + error);
		res.status(500).json({ message: "Internal Server Error" });
	}
};

export const addTyping = async (req, res) => {
	try {
		const { group } = req.body;

		if (group) {
			const { id: gID } = req.params;
			const sID = req.user._id;

			const members = (await Group.findById(gID).select("members"))
				.members;

            await Promise.all(
			members.map(async(rID) => {
				if (rID.toString() !== sID.toString()) {
					const recieverSocketId = await getRecieverSocketId(rID);
					if (recieverSocketId) {
						io.to(recieverSocketId).emit("addTyping", {
							group: true,
							gID,
						});
					}
				}
			}));
		} else {
			const { id: rID } = req.params;
			const sID = req.user._id;

			const recieverSocketId = await getRecieverSocketId(rID);
			if (recieverSocketId) {
				io.to(recieverSocketId).emit("addTyping", {
					group: false,
					sID,
				});
			}
		}
		res.status(200).json({ message: "Sent" });
	} catch (error) {
		console.error("Error sending message:", error);
	}
};
export const removeTyping = async (req, res) => {
	try {
		const { group } = req.body;
		if (group) {
			const { id: gID } = req.params;
			const sID = req.user._id;
			const members = (await Group.findById(gID).select("members"))
				.members;

            await Promise.all(
			members.map(async(rID) => {
				if (rID.toString() !== sID.toString()) {
					const recieverSocketId = await getRecieverSocketId(rID);
					if (recieverSocketId) {
						io.to(recieverSocketId).emit("removeTyping", {
							group: true,
							gID,
						});
					}
				}
			}));
		} else {
			const { id: rID } = req.params;
			const sID = req.user._id;
			const recieverSocketId = await getRecieverSocketId(rID);
			if (recieverSocketId) {
				io.to(recieverSocketId).emit("removeTyping", {
					group: false,
					sID,
				});
			}
		}
		res.status(200).json({ message: "Sent" });
	} catch (error) {
		console.error("Error sending message:", error);
	}
};
