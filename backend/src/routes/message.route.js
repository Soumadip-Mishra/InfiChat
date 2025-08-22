import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {
	usersSidebar,
	getPrivateMessage,
	sendPrivateMessage,
	getGroupMessage,
	sendGroupMessage,
	addTyping,
	removeTyping,
} from "../controllers/message.controller.js";
import multer from "multer";

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "./my-uploads");
	},
	filename: function (req, file, cb) {
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		const ext = file.originalname.split(".").pop();
		cb(null, file.fieldname + "-" + uniqueSuffix + "." + ext);
		req.localImageURL =
			"./my-uploads/" + file.fieldname + "-" + uniqueSuffix + "." + ext;
	},
});
const upload = multer({ storage: storage });

const router = express.Router();

router.get("/users-sidebar", protectRoute, usersSidebar);

router.get("/private/get-message/:id", protectRoute, getPrivateMessage);
router.post(
	"/private/send-message/:id",
	protectRoute,
	upload.single("image"),
	sendPrivateMessage
);

router.get("/group/:id/get-message", protectRoute, getGroupMessage);
router.post(
	"/group/:id/send-message",
	protectRoute,
	upload.single("image"),
	sendGroupMessage
);

router.post("/add-typing/:id", protectRoute, addTyping);
router.post("/remove-typing/:id", protectRoute, removeTyping);

export default router;
