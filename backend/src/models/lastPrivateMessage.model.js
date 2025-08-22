import mongoose from "mongoose";

const LastPrivateMessageSchema = new mongoose.Schema(
	{
		currUserID: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		targetUserID: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		time: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true }
);
const LastPrivateMessage = mongoose.model(
	"LastPrivateMessage",
	LastPrivateMessageSchema
);
export default LastPrivateMessage;
