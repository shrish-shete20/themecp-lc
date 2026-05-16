const express = require("express");
const router = express.Router();
const { 
  getProblem, 
  getQuestionFromProblemId, 
  getRatingFromProblemId 
} = require("../controllers/problemController");

const {getUserIdFromEmail} = require("../controllers/contestController")

router.get("/get_problem", getUserIdFromEmail, getProblem);
router.get("/get_question_from_problem_id", getQuestionFromProblemId);
router.get("/get_rating_from_problem_id", getRatingFromProblemId);

module.exports = router;