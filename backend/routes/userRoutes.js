const express = require("express");
const router = express.Router();
const { addUser, getProfileName, saveProfileName, getThemeDetail } = require("../controllers/userController");
const { getUserIdFromEmail } = require("../controllers/contestController");
const { requireAuth } = require("../middleware/auth");

router.post("/add_user", requireAuth, addUser);
router.post("/save_profile_name", requireAuth, saveProfileName);
router.get("/get_profile_name", requireAuth, getProfileName);
router.get("/theme_detail", requireAuth, getUserIdFromEmail, getThemeDetail);

module.exports = router;