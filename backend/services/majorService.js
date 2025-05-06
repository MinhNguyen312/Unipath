const repository = require("../repositories/majorRepository");

const getMajors = async () => {
  const [rows] = await repository.getDistinctMajors();
  return rows;
};

const getUniversities = async (major) => {
  const [rows] = await repository.getDistinctUniversitiesByMajor(major);
  return rows;
};

const getMajorDetails = async (major, university) => {
  const [rows] = await repository.getMajorInfo(major, university);
  return rows.length ? rows[0] : null;
};

const getScoreData = async (major, university) => {
  const [rows] = await repository.getScoreChart(major, university);
  return rows.map(({ nam, diem }) => ({ nam, diem }));
};

module.exports = {
  getMajors,
  getUniversities,
  getMajorDetails,
  getScoreData,
};