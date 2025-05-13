const express = require("express");
const router = express.Router();
const controller = require("../controllers/majorController");

// Health check
router.get("/", (req, res) => res.json({ message: "pong" }));

router.get("/majors", controller.getMajors);
router.get("/universities", controller.getUniversities);
router.get("/major-info", controller.getMajorInfo);
router.get("/score-chart", controller.getScoreChart);
router.post("/matches", controller.getMatches);
module.exports = router;
