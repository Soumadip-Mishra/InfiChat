import bcrypt from "bcryptjs";
import fs from "fs";
import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import { generateToken, getPublicID } from "../lib/utils.js";
import { generatePublicPrivateKey, encryptWithPassword, decryptWithPassword } from "../lib/crypto.js";
import Group from "../models/group.model.js";

export const signUp = async (req, res) => {
	try {
		const name = req.body.name.trim();
		const email = req.body.email.trim();
		const password = req.body.password.trim();

		if (!name || !email || !password) {
			res.status(400).json({ message: "All fields should be filled" });
			return;
		}
		if (name.length < 4 || name.length > 15) {
			res.status(400).json({
				message:
					"Name must be greater than 4 characters and less than 15 characters",
			});
			return;
		}
		if (password.length < 6) {
			res.status(400).json({
				message: "Password must be greater than 6",
			});
			return;
		}

		const userPresent = await User.findOne({ email });
		if (userPresent) {
			res.status(400).json({
				message: "User with same email already exists",
			});
			return;
		}

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);
        const { privateKey, publicKey } = await generatePublicPrivateKey();
        const hashedPrivateKey = await encryptWithPassword(privateKey, password);
		const newUser = new User({
			name,
			email,
			password: hashedPassword,
            publicKey,
            privateKey: hashedPrivateKey,
		});
		generateToken(newUser._id, res);
		await newUser.save();
        newUser.privateKey = privateKey;
		return res.status(201).json(newUser);
	} catch (error) {
		console.error("Error in sign-up ", error);
		res.status(500).json({ message: "Internal Server Error" });
	}
};

export const logIn = async (req, res) => {
	try {
		const email = req.body.email.trim();
		const password = req.body.password.trim();

		const user = await User.findOne({ email });
		if (!user) {
			res.status(400).json({ message: "Invalid credinials" });
			return;
		}
		const hashedPassword = await bcrypt.compare(password, user.password);
		if (!hashedPassword) {
			res.status(400).json({ message: "Invalid credinials" });
			return;
		}
		generateToken(user._id, res);
        const decryptedPrivateKey = await decryptWithPassword(user.privateKey, password);
        user.privateKey = decryptedPrivateKey;
		return res.status(201).json(user);
	} catch (error) {
		console.error("Error in login ", error);
		res.status(500).json({ message: "Internal Server Error" });
	}
};

export const logOut = async(req, res) => {
	try {
        await Group.updateMany({},{$set:{groupPic : ""}});
        await User.updateMany({}, { $set: { profilePic: "" } });

		res.cookie("jwt", "", { maxAge: 0 });
		res.status(200).json({ message: "logged out successfully" });
	} catch (error) {
		console.error("Error in log-out ", error);
		res.status(500).json({ message: "Internal Server Error" });
	}
};

export const checkAuth = async(req, res) => {
	try {
		res.status(200).json(req.user);
	} catch (error) {
		console.error("Error in checkAuth ", error.message);
		res.status(500).json({ message: "Internal Server Error" });
	}
};

export const changePic = async (req, res) => {
	try {
		const user = await User.findOne({ email: req.user.email });
		const filePath = req.file.path;
        
        if (user.profilePic){
            const publicID = getPublicID("chat-app/avatars/",user.profilePic);
            await cloudinary.uploader.destroy( publicID  );
        }
		const uploadRes = await cloudinary.uploader.upload(filePath, {
			folder: "chat-app/avatars",
			transformation: [{ quality: "auto" }],
		});

		user.profilePic = uploadRes.secure_url;
		await user.save();
		fs.unlinkSync(filePath);
		res.status(200).json(user);
	} catch (error) {
		console.error("Error in changing profile pic", error);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const changeName = async (req, res) => {
	try {
		const user = await User.findOne({ email: req.user.email });
		const newName = req.body.newName.trim();
		if (newName.length < 4 || newName.length > 15) {
			res.status(400).json({
				message:
					"Name must be greater than 4 characters and less than 15 characters",
			});
			return;
		}

		user.name = newName;
		await user.save();
		res.status(200).json(user);
	} catch (error) {
		res.status(500).json({ message: "Internal server error" });
		console.error("Error in changing name", error);
	}
};

export const changePassword = async (req, res) => {
	try {
		const user = await User.findOne({ email: req.user.email });
		const oldPassword = req.body.oldPassword.trim();
		const newPassword = req.body.newPassword.trim();
		const confirmPassword = req.body.confirmPassword.trim();

		async function check() {
			const match = await bcrypt.compare(oldPassword, user.password);
			if (!match) {
				res.status(400).json({ message: "Old Password do not match" });
				return;
			} else if (newPassword !== confirmPassword) {
				res.status(400).json({
					message:
						"Confirmed Password does not match with the New Password",
				});
				return;
			} else if (newPassword.trim().length < 6) {
				res.status(400).json({
					message: "Password must be greater than 6",
				});
				return;
			}
		}
		await check();

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(newPassword, salt);
		user.password = hashedPassword;

		await user.save();
		res.status(200).json(user);
	} catch (error) {
		res.status(500).json({ message: "Internal server error" });
		console.error("Error in changing password", error);
	}
};
