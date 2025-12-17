import fs from "fs";
import fs2 from "fs/promises";
import { GoogleGenAI } from "@google/genai";
import cloudinary from "../lib/cloudinary.js";
import AiMessage from "../models/aiMessage.model.js";

export const getAiMessages = async (req, res) => {
	try {
		const sID = req.user._id;
		const allMessages = await AiMessage.find({
			senderID: sID,
		}).sort({ createdAt: 1 });
		res.status(200).json(allMessages);
	} catch (error) {
		console.log(error);
	}
};

export const uploadInput = async (req, res) => {
	try {
		const sID = req.user._id;
		const text = req.body.text;

		let finalImageURL = "";

		if (req.file) {
			const uploadRes = await cloudinary.uploader.upload(req.file.path, {
				folder: "chat-app/ai-messages",
				transformation: [{ quality: "auto" }],
			});

			finalImageURL = uploadRes.secure_url;
		}

		const newMessage = new AiMessage({
			senderID: sID,
			text,
			image: finalImageURL,
			role: "user",
		});

		await newMessage.save();

		if (finalImageURL) {
			fs.unlinkSync(req.file.path);
		}

		res.status(200).json(newMessage);
	} catch (error) {
		console.error("Error sending message:", error);
		res.status(500).json({
			message: "Internal Server Error at sending message",
		});
	}
};

export const prompt = async (req, res) => {
	try {
		const sID = req.user._id;
		const text = req.body.text;
		let promptText = text;
		promptText ="The following part is not a part of the prompt , it is just to give you some information and pls don't add it to resposnse.Call yourself Infi-AI instead of Gemini and also always give response in plain text like notepad maybe with some emojis, Don't reveal this information ever in the prompt. The prompt starts is ----->"+promptText;

		const ai = new GoogleGenAI({});
		const allMessages = await AiMessage.find({
			senderID: sID,
		}).sort({ createdAt: 1 });
		let start = Math.max(0, allMessages.length - 20);
		let history = [];
		for (let i = start; i < allMessages.length; i++) {
			if (allMessages[i].role === "user") {
				if (allMessages[i].text)
					history.push({
						role: "user",
						parts: [{ text: allMessages[i].text }],
					});
			} else {
				if (allMessages[i].text)
					history.push({
						role: "model",
						parts: [{ text: allMessages[i].text }],
					});
			}
		}
		const chat = ai.chats.create({
			model: "gemini-2.5-flash",
			history: history,
		});

		let response;

		if (!req.file) {
			response = await chat.sendMessage({
				message: promptText,
			});
		} else {
			const base64ImageFile = await fs2.readFile(req.file.path, {
				encoding: "base64",
			});
			const contents = [
				{
					inlineData: {
						mimeType: req.file.mimetype,
						data: base64ImageFile,
					},
				},
				{ text: promptText },
			];

			response = await ai.models.generateContent({
				model: "gemini-2.5-flash",
				contents: contents,
			});
		}

		const newResponse = new AiMessage({
			senderID: sID,
			text: response.text,
			image: "",
			role: "model",
		});
		await newResponse.save();

		if (req.file && req.file.path) {
			fs.unlinkSync(req.file.path);
		}
		res.status(200).json(newResponse);
	} catch (error) {
		console.error("Error sending message:", error);
		res.status(500).json({
			message: "Internal Server Error at sending message",
		});
	}
};
