import mongoose from "mongoose";

const AiMessageSchema = new mongoose.Schema(
	{
		senderID: {
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
		role: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true }
);

const AiMessage = mongoose.model("AiMessage", AiMessageSchema);
export default AiMessage;
