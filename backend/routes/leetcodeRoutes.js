const express = require("express");
const router = express.Router();
const { getLeetcodeProfile, getRecentSubmission } = require("../controllers/leetcodeController");

router.get("/leetcode-profile", getLeetcodeProfile);
router.get("/recent-submissions", getRecentSubmission);

module.exports = router;
