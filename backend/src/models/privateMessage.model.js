import mongoose from "mongoose";

const PrivateMessageSchema = new mongoose.Schema(
	{
		senderID: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		recieverID: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		text: {
			type: String,
		},
		image: {
			type: String,
		},
	},
	{ timestamps: true }
);
const PrivateMessage = mongoose.model("PrivateMessage", PrivateMessageSchema);
export default PrivateMessage;
