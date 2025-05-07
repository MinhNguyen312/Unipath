const fs = require("fs");
const path = require("path");
const pool = require("./db");

// Wait for MySQL to be ready
async function waitForMySQL(retries = 10, delay = 3000) {
    while (retries) {
        try {
            await pool.query("SELECT 1");
            console.log("MySQL is ready.");
            return;
        } catch (err) {
            console.log(
                `Waiting for MySQL... retrying in ${
                    delay / 1000
                }s (${retries} left)`
            );
            await new Promise((res) => setTimeout(res, delay));
            retries--;
        }
    }
    throw new Error("MySQL did not become ready in time.");
}

// Create table if it doesn't exist
async function initDatabase() {
    const sqlScore = `
    CREATE TABLE IF NOT EXISTS majors (
      id INT AUTO_INCREMENT PRIMARY KEY,
      ma_truong VARCHAR(10),
      ten_truong VARCHAR(255),
      dia_diem VARCHAR(255),
      ma_nganh VARCHAR(20),
      ten_nganh VARCHAR(255),
      diem FLOAT,
      to_hop_mon VARCHAR(255),
      hoc_phi VARCHAR(255),
      nam TEXT
    )
  `;
    await pool.query(sqlScore);
    console.log("Table 'majors' is ready.");
    const sqlPredicts = `
    CREATE TABLE IF NOT EXISTS predicts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ma_truong VARCHAR(10),
    ten_truong VARCHAR(255),
    dia_diem VARCHAR(255),
    ma_nganh VARCHAR(20),
    ten_nganh VARCHAR(255),
    diem FLOAT,
    to_hop_mon VARCHAR(255),
    nam TEXT
    )
    `;
    await pool.query(sqlPredicts);
    console.log("Table 'predicts' is ready.");
}

// Helper to extract year from filename (e.g., vnexpress_2020.csv → 2020)
function extractYearFromFilename(filePath) {
    const match = path.basename(filePath).match(/_(\d{4})/);
    return match ? match[1] : null;
}

// Import a single CSV file
async function importScoreCSV(filePath) {
  const absolutePath = path.resolve(filePath);
  const year = extractYearFromFilename(filePath);

  if (!year) {
        console.error(`Cannot extract year from filename: ${filePath}`);
        return;
  }

  const sql = `
        LOAD DATA LOCAL INFILE 'dummy.csv' INTO TABLE majors
        FIELDS TERMINATED BY ',' 
        ENCLOSED BY '"' 
        LINES TERMINATED BY '\\n'
        IGNORE 1 LINES
        (ma_truong, ten_truong, dia_diem, ma_nganh, ten_nganh, diem, to_hop_mon, hoc_phi)
        SET nam = ?
  `;

  await pool.query({
      sql,
      values: [year],
      infileStreamFactory: () => fs.createReadStream(absolutePath),
  });

  console.log(`Imported: ${filePath} with nam = ${year}`);
}

async function importPredictCSV(filePath) {
    const absolutePath = path.resolve(filePath);
    const year = extractYearFromFilename(filePath);
  
    if (!year) {
        console.error(`Cannot extract year from filename: ${filePath}`);
        return;
    }
  
    const sql = `
        LOAD DATA LOCAL INFILE 'dummy.csv' INTO TABLE predicts
        FIELDS TERMINATED BY ',' 
        ENCLOSED BY '"'
        LINES TERMINATED BY '\\n'
        IGNORE 1 LINES
        (ma_truong, ten_truong, dia_diem, ma_nganh, ten_nganh, diem, to_hop_mon)
        SET nam = ?
    `;
  
    await pool.query({
      sql,
      values: [year],
      infileStreamFactory: () => fs.createReadStream(absolutePath),
    });
  
    console.log(`Imported: ${filePath} into 'predicts' with nam = ${year}`);
}
  

// Import all CSV files in the directory
async function importAllScoreCSVs() {
    const csvDir = path.join(__dirname, "../csv-file/csv-score");
    const files = fs
        .readdirSync(csvDir)
        .filter((file) => file.endsWith(".csv"));

    for (const file of files) {
        const fullPath = path.join(csvDir, file);
        try {
            await importScoreCSV(fullPath);
        } catch (err) {
            console.error(`Error importing ${file}:`, err.message);
        }
    }

    console.log("All CSV Score files processed.");
}

async function importPredictCSV(filePath) {
    const absolutePath = path.resolve(filePath);
    const year = extractYearFromFilename(filePath);
  
    if (!year) {
        console.error(`Cannot extract year from filename: ${filePath}`);
        return;
    }
  
    const sql = `
        LOAD DATA LOCAL INFILE 'dummy.csv' INTO TABLE predicts
        FIELDS TERMINATED BY ',' 
        ENCLOSED BY '"'
        LINES TERMINATED BY '\\n'
        IGNORE 1 LINES
        (ma_truong, ten_truong, dia_diem, ma_nganh, ten_nganh, diem, to_hop_mon)
        SET nam = ?
    `;
  
    await pool.query({
      sql,
      values: [year],
      infileStreamFactory: () => fs.createReadStream(absolutePath),
    });
  
    console.log(`Imported: ${filePath} into 'predicts' with nam = ${year}`);
}
 
async function importAllPredictCSVs() {
    const csvDir = path.join(__dirname, "../csv-file/csv-predict");
    const files = fs
      .readdirSync(csvDir)
      .filter((file) => file.endsWith(".csv"));
  
    for (const file of files) {
      const fullPath = path.join(csvDir, file);
      try {
        await importPredictCSV(fullPath);
      } catch (err) {
        console.error(`Error importing predict ${file}:`, err.message);
      }
    }
  
    console.log("All predict CSV files processed.");
}
  


// Run the entire process
async function loadData() {
  await waitForMySQL();
  await initDatabase();
  const [rowsMajors] = await pool.query("SELECT COUNT(*) AS count FROM majors");
  const countMajors = rowsMajors[0].count;
  const [rowsPredicts] = await pool.query("SELECT COUNT(*) AS count FROM predicts");
  const countPredicts = rowsPredicts[0].count;

  if (countMajors === 0) {
    console.log("Table is empty. Importing CSVs...");
    await importAllScoreCSVs();
  } else {
    console.log(`Table majors already has ${countMajors} rows. Skipping import.`);
  }

  if (countPredicts === 0) {
    console.log("Table is empty. Importing CSVs...");
    await importAllPredictCSVs();
  } else {
    console.log(`Table predicts already has ${countPredicts} rows. Skipping import.`);
  }
}

module.exports = loadData;