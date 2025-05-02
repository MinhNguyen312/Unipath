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


// Compare major info
router.get("/major-info", async (req, res) => {
  const { major, university } = req.query;

  if (!major || !university) {
    return res.status(400).json({ error: "Missing 'major' or 'university' query param" });
  }

  try {
    const [rows] = await pool.query(
      `
      SELECT dia_diem, to_hop_mon, hoc_phi
      FROM majors
      WHERE ten_nganh = ? AND ten_truong = ?
      LIMIT 1
      `,
      [major, university]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("DB error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Major score history chart
router.get("/score-chart", async (req, res) => {
  const { major, university } = req.query;

  if (!major || !university) {
    return res.status(400).json({ error: "Missing 'major' or 'university' query param" });
  }

  try {
    const [rows] = await pool.query(
      `
      SELECT nam, diem
      FROM majors
      WHERE ten_nganh = ? AND ten_truong = ?
      ORDER BY nam ASC
      `,
      [major, university]
    );

    const formatted = rows.map((row) => ({
      nam: row.nam,
      diem: row.diem,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("DB error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


  
module.exports = router;