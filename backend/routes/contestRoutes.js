const express = require("express");
const router = express.Router();
const { requireSupabaseAuth } = require("../middleware/supabaseAuth");

const {
    getUserIdFromEmail,
    getProblemIds,
    addContest,
    isContestRunning,
    insertSolvedProblems,
    getContest,
    getContestHistory
} = require("../controllers/contestController");

router.post("/add_contest", requireSupabaseAuth, getUserIdFromEmail, addContest);
router.get("/is_contest_running", requireSupabaseAuth, getUserIdFromEmail, isContestRunning);
router.post("/update_submission", requireSupabaseAuth, getUserIdFromEmail, getProblemIds, insertSolvedProblems);
router.get("/get_contest", requireSupabaseAuth, getUserIdFromEmail, getContest);
router.get("/contest_history", requireSupabaseAuth, getUserIdFromEmail, getContestHistory);

module.exports = router;