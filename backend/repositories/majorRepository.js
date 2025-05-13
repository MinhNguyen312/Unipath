const pool = require("../database/db");

const getDistinctMajors = () =>
  pool.query("SELECT DISTINCT ten_nganh FROM majors ORDER BY ten_nganh");

const getDistinctUniversitiesByMajor = (major) =>
  pool.query(
    "SELECT DISTINCT ten_truong FROM majors WHERE ten_nganh = ? ORDER BY ten_truong",
    [major]
  );

const getMajorInfo = (major, university) =>
  pool.query(
    "SELECT dia_diem, to_hop_mon, hoc_phi FROM majors WHERE ten_nganh = ? AND ten_truong = ? AND nam = 2024 LIMIT 1",
    [major, university]
  );

const getScoreChart = (major, university) =>
  pool.query(
    "SELECT nam, diem FROM majors WHERE ten_nganh = ? AND ten_truong = ? ORDER BY nam ASC",
    [major, university]
  );

async function getMajorsByComboAndScore(comboCode, userScore) {
  const [rows] = await pool.query(
    `
    SELECT 
  m.*, 
  ? AS user_score,
  p.diem AS predicted_diem,
  p.nam AS predicted_year,
  (p.diem - m.diem) AS score_diff
FROM majors m
LEFT JOIN predicts p 
  ON m.ma_truong = p.ma_truong 
  AND m.ma_nganh = p.ma_nganh 
  AND m.to_hop_mon = p.to_hop_mon 
  AND p.nam = 2025
WHERE 
  CONCAT(',', m.to_hop_mon, ',') LIKE CONCAT('%,', ?, ',%')
  AND m.diem <= ?
  AND ? >= m.diem - 2
  AND m.nam = 2024;

    `, 
    [userScore, comboCode, userScore, userScore]
  );
  return rows;
}

module.exports = {
  getDistinctMajors,
  getDistinctUniversitiesByMajor,
  getMajorInfo,
  getScoreChart,
  getMajorsByComboAndScore
};
