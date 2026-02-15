import fs from "fs";
import cloudinary from "../lib/cloudinary.js";
import { getPublicID } from "../lib/utils.js";
import Group from "../models/group.model.js";
import User from "../models/user.model.js";
import LastGroupMessage from "../models/lastGroupMessage.model.js";

export const groupsSidebar = async (req, res) => {
	try {
		const groupIDs = (await User.findById(req.user._id)).groups.map(
			(g) => g.groupID
		);

		const sortedGroupIDs = (
			await LastGroupMessage.find({ groupID: { $in: groupIDs } })
				.sort({ updatedAt: -1 })
				.select("groupID")
		).map((g) => g.groupID);

		groupIDs.forEach((g) => {
			if (!sortedGroupIDs.some((id) => id.toString() === g.toString())) {
				sortedGroupIDs.push(g);
			}
		});

		const groups = await Group.find({ _id: { $in: sortedGroupIDs } });
		const sortedGroups = sortedGroupIDs.map((id) =>
			groups.find((group) => group._id.toString() === id.toString())
		);

		res.status(200).json(sortedGroups);
	} catch (error) {
		console.error("Error in loading side users " , error);
		res.status(500).json({ message: "Internal Server Error" });
	}
};
export const groupInfo = async (req, res) => {
	try {
		const { id: groupID } = req.params;
		const group = await Group.findById(groupID);
		if (!group) {
			res.status(400).json({ message: "Group not found" });
			return;
		}
		if (!group.members.includes(req.user._id)) {
			res.status(400).json({ message: "User not present in group" });
			return;
		}

		const resGroup = await Group.findById(groupID).populate(
			"members",
			"-password"
		);
		res.status(200).json(resGroup);
	} catch (error) {
		console.error("Error in getting group info " , error);
		res.status(500).json({ message: "Internal Server Error" });
	}
};
export const createGroup = async (req, res) => {
	try {
		const { name: name, members } = req.body;

		const trimmedName = name.trim();
		if (trimmedName.length < 4 || trimmedName.length > 15) {
			return res.status(400).json({
				message: "Group name must be between 4 and 15 characters",
			});
		}
		const usersPresent = await User.find({ _id: { $in: members } }).select(
			"_id"
		);
		const memberIds = usersPresent.map((member) => member._id);
		memberIds.push(req.user._id);

		const group = new Group({
			name: trimmedName,
			groupPic: "",
			groupDescription: "",
			members: memberIds,
			admins: [req.user._id],
		});

		await Promise.all(
			memberIds.map(async (memberId) => {
				await User.updateOne(
					{ _id: memberId },
					{ $push: { groups: { groupID: group._id } } }
				);
			})
		);

		await group.save();
		res.status(201).json(group);
	} catch (error) {
		console.error("Error in creating group " , error);
		res.status(500).json({ message: "Internal Server Error" });
	}
};

export const getMembers = async (req, res) => {
	try {
		const { id: groupID } = req.params;
		const group = await Group.findOne({ _id: groupID });
		if (!group) {
			res.status(400).json({ message: "Group not found" });
			return;
		}
		if (!group.members.includes(req.user._id)) {
			res.status(400).json({ message: "User not present in group" });
			return;
		}
		const members = await Group.findOne({ _id: groupID })
			.select("members")
			.populate("members", "-password");
		res.status(200).json(members);
	} catch (error) {
		console.error("Error in getting members " , error);
		res.status(500).json({ message: "Internal Server Error" });
	}
};

export const changePic = async (req, res) => {
	try {
		const { id: groupID } = req.params;
		const group = await Group.findOne({ _id: groupID });
		let finalImageURL = "";
		if (!group) {
			res.status(400).json({ message: "Group not found" });
			return;
		}
		if (!group.members.includes(req.user._id)) {
			res.status(400).json({ message: "User not present in group" });
			return;
		}
		if (!req.file) {
			res.status(400).json({ message: "Image not found" });
			return;
		} else {
			if (group.groupPic) {
				const publicID = getPublicID("chat-app/group-avatars/",group.groupPic)
				await cloudinary.uploader.destroy(publicID);
			}
			const uploadRes = await cloudinary.uploader.upload(req.file.path, {
				folder: "chat-app/group-avatars",
				transformation: [{ quality: "auto" }],
			});

			finalImageURL = uploadRes.secure_url;
			fs.unlinkSync(req.file.path);
		}
		const updatedInfo = await Group.findByIdAndUpdate(
			groupID,
			{ $set: { groupPic: finalImageURL } },
			{ new: true }
		).populate("members", "-password");

		res.status(200).json(updatedInfo);
	} catch (error) {
		console.error("Error in changing Picture " , error);
		res.status(500).json({ message: "Internal Server Error" });
	}
};

export const changeName = async (req, res) => {
	try {
		const { id: groupID } = req.params;
		const group = await Group.findOne({ _id: groupID });
		const name = req.body.name.trim();
		if (!group) {
			res.status(400).json({ message: "Group not found" });
			return;
		}
		if (!group.members.includes(req.user._id)) {
			res.status(400).json({ message: "User not present in group" });
			return;
		}
		if (name.length < 4 || name.length > 15) {
			res.status(400).json({
				message: "Name must be between 4 and 15 characters",
			});
		}
		const updatedInfo = await Group.findByIdAndUpdate(
			groupID,
			{ $set: { name } },
			{ new: true }
		).populate("members", "-password");
		res.status(200).json(updatedInfo);
	} catch (error) {
		console.error("Error in changing name " , error);
		res.status(500).json({ message: "Internal Server Error" });
	}
};

export const changeDescription = async (req, res) => {
	try {
		const { id: groupID } = req.params;
		const group = await Group.findOne({ _id: groupID });
		const description = req.body.description.trim();
		if (!group) {
			res.status(400).json({ message: "Group not found" });
			return;
		}
		if (!group.members.includes(req.user._id)) {
			res.status(400).json({ message: "User not present in group" });
			return;
		}
		const updatedInfo = await Group.findByIdAndUpdate(
			groupID,
			{ $set: { groupDescription: description } },
			{ new: true }
		).populate("members", "-password");
		res.status(200).json(updatedInfo);
	} catch (error) {
		console.error("Error in changing description " , error);
		res.status(500).json({ message: "Internal Server Error" });
	}
};

export const addMember = async (req, res) => {
	try {
		const { newMembers } = req.body;
		const { id: groupID } = req.params;

		const group = await Group.findById(groupID);
		if (!group) {
			return res.status(400).json({ message: "Group not found" });
		}

		if (!group.admins.includes(req.user._id)) {
			return res.status(400).json({ message: "User not admin in group" });
		}

		const membersPresent = await User.find({
			_id: { $in: newMembers },
		}).select("_id");
		const memberIDs = membersPresent.map((m) => m._id);

		await Promise.all(
			memberIDs.map(async (memberId) => {
				await User.updateOne(
					{ _id: memberId, "groups.groupID": { $ne: groupID } },
					{ $push: { groups: { groupID } } }
				);
			})
		);

		const updatedInfo = await Group.findByIdAndUpdate(
			groupID,
			{ $addToSet: { members: { $each: memberIDs } } },
			{ new: true }
		).populate("members", "-password");

		res.status(200).json(updatedInfo);
	} catch (error) {
		console.error("Error in adding member ", error);
		res.status(500).json({ message: "Internal Server Error" });
	}
};

export const makeAdmin = async (req, res) => {
	try {
		const { newMemberID } = req.body;
		const { id: groupID } = req.params;
		const group = await Group.findOne({ _id: groupID });
		if (!group) {
			res.status(400).json({ message: "Group not found" });
			return;
		}
		if (!group.admins.includes(req.user._id)) {
			res.status(400).json({ message: "User not admin in group" });
			return;
		}
		if (!group.members.includes(newMemberID)) {
			res.status(400).json({
				message: "Member to be made admin not present in the group",
			});
			return;
		}
		const updatedInfo = await Group.findByIdAndUpdate(
			groupID,
			{
				$addToSet: { admins: newMemberID },
			},
			{ new: true }
		).populate("members", "-password");

		res.status(200).json(updatedInfo);
	} catch (error) {
		console.error("Error in making admin ", error);
		res.status(500).json({ message: "Internal Server Error" });
	}
};

export const removeMember = async (req, res) => {
	try {
		const { newMemberID } = req.query;
		const { id: groupID } = req.params;
		const group = await Group.findOne({ _id: groupID });
		if (!group) {
			res.status(400).json({ message: "Group not found" });
			return;
		}
		if (!group.admins.includes(req.user._id)) {
			res.status(400).json({ message: "User not admin in group" });
			return;
		}
		if (group.admins.includes(newMemberID)) {
			res.status(400).json({
				message: "Cannot remove an admin",
			});
			return;
		}
		const updatedInfo = await Group.findByIdAndUpdate(
			groupID,
			{
				$pull: { members: newMemberID },
			},
			{ new: true }
		).populate("members", "-password");

		await User.updateOne(
			{ _id: newMemberID },
			{ $pull: { groups: { groupID } } }
		);

		res.status(200).json(updatedInfo);
	} catch (error) {
		console.error("Error in removing member ", error);
		res.status(500).json({ message: "Internal Server Error" });
	}
};

export const exitGroup = async (req, res) => {
	try {
		const userID = req.user._id;
		const { id: groupID } = req.params;
		const group = await Group.findOne({ _id: groupID });
		if (!group) {
			res.status(400).json({ message: "Group not found" });
			return;
		}
		await Group.findByIdAndUpdate(groupID, {
			$pull: { members: userID },
		});
		await User.updateOne(
			{ _id: userID },
			{ $pull: { groups: { groupID } } }
		);
		res.status(200).json({ message: "Successfully exited the group" });
	} catch (error) {
		console.error("Error in exiting group ", error);
		res.status(500).json({ message: "Internal Server Error" });
	}
};
