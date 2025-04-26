const express = require('express');
const router = express.Router();
const pool = require("../database/db");

//  /api/
router.get('/', (req,res) => {
    res.json({message: 'pong'});
});

router.get("/majors", async (req, res) => {
    const [rows] = await pool.query("SELECT DISTINCT ten_nganh FROM majors ORDER BY ten_nganh");
    res.json(rows);
});

// Select distinct universities by major
router.get("/universities", async (req, res) => {
    const major = req.query.major;
  
    if (!major) {
      return res.status(400).json({ error: "Missing 'major' query param" });
    }
  
    try {
      const [rows] = await pool.query(
        `
        SELECT DISTINCT ten_truong
        FROM majors
        WHERE ten_nganh = ?
        ORDER BY ten_truong
        `,
        [major]
      );
  
      res.json(rows);
    } catch (error) {
      console.error("DB error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
module.exports = router;