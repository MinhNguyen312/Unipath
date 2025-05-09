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
    "SELECT dia_diem, to_hop_mon, hoc_phi FROM majors WHERE ten_nganh = ? AND ten_truong = ? LIMIT 1",
    [major, university]
  );

const getScoreChart = (major, university) =>
  pool.query(
    "SELECT nam, diem FROM majors WHERE ten_nganh = ? AND ten_truong = ? ORDER BY nam ASC",
    [major, university]
  );

module.exports = {
  getDistinctMajors,
  getDistinctUniversitiesByMajor,
  getMajorInfo,
  getScoreChart,
};
