const express = require("express");
const router = express.Router();
const {
    getLeetcodeProfile,
    getLeetcodeProfileStats,
    getRecentSubmission
} = require("../controllers/leetcodeController");

router.get("/leetcode-profile", getLeetcodeProfile);
router.get("/profile-stats", getLeetcodeProfileStats);
router.get("/recent-submissions", getRecentSubmission);
router.get("/:username", getLeetcodeProfile);

module.exports = router;
