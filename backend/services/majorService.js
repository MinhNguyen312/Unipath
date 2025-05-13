const repository = require("../repositories/majorRepository");
const redisClient = require("../infra/redisClient");

const getMajors = async () => {
  const cacheKey = "majors:list";

  const cached = await redisClient.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  const [rows] = await repository.getDistinctMajors();
  await redisClient.set(cacheKey, JSON.stringify(rows), { EX: 3600 });

  return rows;
};

const getUniversities = async (major) => {
  const cacheKey = `universities:major:${major}`;

  const cached = await redisClient.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  const [rows] = await repository.getDistinctUniversitiesByMajor(major);
  await redisClient.set(cacheKey, JSON.stringify(rows), { EX: 3600 });

  return rows;
};

const getMajorDetails = async (major, university) => {
  const cacheKey = `majorDetail:${major}:${university}`;

  const cached = await redisClient.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  const [rows] = await repository.getMajorInfo(major, university);
  const result = rows.length ? rows[0] : null;

  await redisClient.set(cacheKey, JSON.stringify(result), { EX: 3600 });
  return result;
};

const getScoreData = async (major, university) => {
  const cacheKey = `scoreChart:${major}:${university}`;

  const cached = await redisClient.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  const [rows] = await repository.getScoreChart(major, university);
  const mapped = rows.map(({ nam, diem }) => ({ nam, diem }));

  await redisClient.set(cacheKey, JSON.stringify(mapped), { EX: 3600 });
  return mapped;
};

module.exports = {
  getMajors,
  getUniversities,
  getMajorDetails,
  getScoreData,
};