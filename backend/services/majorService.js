const repository = require("../repositories/majorRepository");
const comboMap = require("../utils/comboMap.js");

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

const getMatchingMajors = async (userScores) => {
    const matches = [];

    for (const [comboCode, subjects] of Object.entries(comboMap)) {
      const subjectScores = subjects.map((s) => userScores[s]);
      if (subjectScores.includes(undefined)) continue;

      const userScore = subjectScores.reduce((sum, s) => sum + s, 0);

      const majors = await repository.getMajorsByComboAndScore(comboCode, userScore);
      majors.forEach((m) => {
        matches.push({
          ...m,
          matchedCombination: comboCode,
          userScore
        });
      });
    }

    console.log(matches);

    return matches;
  }


module.exports = {
  getMajors,
  getUniversities,
  getMajorDetails,
  getScoreData,
  getMatchingMajors
};
