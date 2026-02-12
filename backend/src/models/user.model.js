import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			minlength: 6,
			required: true,
		},
        publicKey: {
			type: String,
			required: true,
		},
        privateKey: {
			type: String,
			required: true,
		},
		profilePic: {
			type: String,
			default: "",
		},
		groups: [
			{
				groupID: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Group",
					required: true,
				},
				joinedAt: {
					type: Date,
					default: Date.now,
				},
			},
		],
	},
	{ timestamps: true }
);

const User = mongoose.model("User", UserSchema);
export default User;
