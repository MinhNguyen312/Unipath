const express = require("express");
const router = express.Router();
const controller = require("../controllers/majorController");

// Health check
router.get("/", (req, res) => res.json({ message: "pong" }));

router.get("/api/majors", controller.getMajors);
router.get("/api/universities", controller.getUniversities);
router.get("/api/major-info", controller.getMajorInfo);
router.get("/api/score-chart", controller.getScoreChart);

module.exports = router;
