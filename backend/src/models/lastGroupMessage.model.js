import mongoose from "mongoose";

const LastGroupMessageSchema = new mongoose.Schema(
	{
		groupID: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Group",
			required: true,
		},
	},
	{ timestamps: true }
);
const LastGroupMessage = mongoose.model(
	"LastGroupMessage",
	LastGroupMessageSchema
);
export default LastGroupMessage;
