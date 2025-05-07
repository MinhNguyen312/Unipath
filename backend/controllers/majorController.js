const service = require("../services/majorService");

const getMajors = async (req, res) => {
  const majors = await service.getMajors();
  res.json(majors);
};

const getUniversities = async (req, res) => {
  const { major } = req.query;
  if (!major) return res.status(400).json({ error: "Missing 'major' query param" });

  try {
    const universities = await service.getUniversities(major);
    res.json(universities);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getMajorInfo = async (req, res) => {
  const { major, university } = req.query;
  if (!major || !university)
    return res.status(400).json({ error: "Missing 'major' or 'university'" });

  try {
    const info = await service.getMajorDetails(major, university);
    if (!info) return res.status(404).json({ error: "Not found" });
    res.json(info);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getScoreChart = async (req, res) => {
  const { major, university } = req.query;
  if (!major || !university)
    return res.status(400).json({ error: "Missing 'major' or 'university'" });

  try {
    const chart = await service.getScoreData(major, university);
    res.json(chart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getMajors,
  getUniversities,
  getMajorInfo,
  getScoreChart,
};
