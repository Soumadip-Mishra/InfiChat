import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {
	groupsSidebar,
	groupInfo,
	createGroup,
	changePic,
	changeName,
	changeDescription,
	getMembers,
	addMember,
	makeAdmin,
	removeMember,
	exitGroup,
} from "../controllers/group.controller.js";

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

router.get("/sidebar", protectRoute, groupsSidebar);
router.get("/:id/info", protectRoute, groupInfo);
router.post("/create-group", protectRoute, createGroup);
router.post(
	"/:id/change/group-pic",
	protectRoute,
	upload.single("image"),
	changePic
);
router.post("/:id/change/group-name", protectRoute, changeName);
router.post("/:id/change/group-description", protectRoute, changeDescription);

router.get("/:id/get-members", protectRoute, getMembers);
router.post("/:id/add-member", protectRoute, addMember);
router.post("/:id/make-admin", protectRoute, makeAdmin);
router.delete("/:id/remove-member", protectRoute, removeMember);
router.delete("/:id/exit-group", protectRoute, exitGroup);

export default router;
