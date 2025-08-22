import express from "express";
import {
	signUp,
	logIn,
	logOut,
	checkAuth,
	changePic,
	changeName,
	changePassword,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
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

router.post("/signup", signUp);
router.post("/login", logIn);
router.delete("/logout", logOut);
router.get("/check", protectRoute, checkAuth);

router.post(
	"/change/profile-pic",
	protectRoute,
	upload.single("image"),
	changePic
);
router.post("/change/name", protectRoute, changeName);
router.post("/change/password", protectRoute, changePassword);

export default router;
