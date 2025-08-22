import mongoose from "mongoose";

const GroupSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		groupPic: {
			type: String,
			default: "",
		},
		groupDescription: {
			type: String,
			default: "",
		},
		members: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
		],
		admins: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
		],
	},
	{ timestamps: true }
);
const Group = mongoose.model("Group", GroupSchema);
export default Group;
