const express = require("express");
const router = express.Router();
const { 
  getProblem, 
  getContestProblems,
  getQuestionFromProblemId, 
  getRatingFromProblemId,
  getUserProblemStats
} = require("../controllers/problemController");

const {getUserIdFromEmail} = require("../controllers/contestController")
const { requireAuth } = require("../middleware/auth");

router.get("/get_problem", requireAuth, getUserIdFromEmail, getProblem);
router.get("/get_contest_problems", requireAuth, getUserIdFromEmail, getContestProblems);
router.get("/get_question_from_problem_id", getQuestionFromProblemId);
router.get("/get_rating_from_problem_id", getRatingFromProblemId);
router.get("/user_stats", requireAuth, getUserIdFromEmail, getUserProblemStats);

module.exports = router;