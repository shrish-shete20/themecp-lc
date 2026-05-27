const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");

const {
    getUserIdFromEmail,
    getProblemIds,
    addContest,
    isContestRunning,
    insertSolvedProblems,
    getContest,
    getContestHistory
} = require("../controllers/contestController");

router.post("/add_contest", requireAuth, getUserIdFromEmail, addContest);
router.get("/is_contest_running", requireAuth, getUserIdFromEmail, isContestRunning);
router.post("/update_submission", requireAuth, getUserIdFromEmail, getProblemIds, insertSolvedProblems);
router.get("/get_contest", requireAuth, getUserIdFromEmail, getContest);
router.get("/contest_history", requireAuth, getUserIdFromEmail, getContestHistory);

module.exports = router;