const express = require("express");
const router = express.Router();
const { addUser, getProfileName, saveProfileName, getThemeDetail } = require("../controllers/userController");
const { getUserIdFromEmail } = require("../controllers/contestController");

router.post("/add_user", addUser);
router.post("/save_profile_name", saveProfileName);
router.get("/get_profile_name", getProfileName);
router.get("/theme_detail", getUserIdFromEmail, getThemeDetail);

module.exports = router;