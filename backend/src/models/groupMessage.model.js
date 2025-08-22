import mongoose from "mongoose";

const GroupMessageSchema = new mongoose.Schema(
	{
		senderID: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		recieverID: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Group",
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
const GroupMessage = mongoose.model("GroupMessage", GroupMessageSchema);
export default GroupMessage;
