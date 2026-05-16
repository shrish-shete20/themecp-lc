const express = require("express");
const router = express.Router();
const { addUser, getProfileName, saveProfileName, getThemeDetail } = require("../controllers/userController");
const { getUserIdFromEmail } = require("../controllers/contestController");
const { requireSupabaseAuth } = require("../middleware/supabaseAuth");

router.post("/add_user", requireSupabaseAuth, addUser);
router.post("/save_profile_name", requireSupabaseAuth, saveProfileName);
router.get("/get_profile_name", requireSupabaseAuth, getProfileName);
router.get("/theme_detail", requireSupabaseAuth, getUserIdFromEmail, getThemeDetail);

module.exports = router;