const express = require("express");
const router = express.Router();
const { 
  getProblem, 
  getQuestionFromProblemId, 
  getRatingFromProblemId,
  getUserProblemStats
} = require("../controllers/problemController");

const {getUserIdFromEmail} = require("../controllers/contestController")
const { requireSupabaseAuth } = require("../middleware/supabaseAuth");

router.get("/get_problem", requireSupabaseAuth, getUserIdFromEmail, getProblem);
router.get("/get_question_from_problem_id", getQuestionFromProblemId);
router.get("/get_rating_from_problem_id", getRatingFromProblemId);
router.get("/user_stats", requireSupabaseAuth, getUserIdFromEmail, getUserProblemStats);

module.exports = router;