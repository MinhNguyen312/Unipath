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
    const sql = `
    CREATE TABLE IF NOT EXISTS majors (
      id INT AUTO_INCREMENT PRIMARY KEY,
      ma_truong VARCHAR(10),
      ten_truong VARCHAR(255),
      dia_diem VARCHAR(255),
      ma_nganh VARCHAR(20),
      ten_nganh VARCHAR(255),
      diem FLOAT,
      to_hop_mon VARCHAR(255),
      ghi_chu TEXT,
      nam TEXT
    )
  `;
    await pool.query(sql);
    console.log("Table 'majors' is ready.");
}

// Helper to extract year from filename (e.g., vnexpress__2020.csv → 2020)
function extractYearFromFilename(filePath) {
    const match = path.basename(filePath).match(/__(\d{4})/);
    return match ? match[1] : null;
}

// Import a single CSV file
async function importCSV(filePath) {
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
      (ma_truong, ten_truong, dia_diem, ma_nganh, ten_nganh, diem, to_hop_mon, ghi_chu)
      SET nam = ?
  `;

  await pool.query({
      sql,
      values: [year],
      infileStreamFactory: () => fs.createReadStream(absolutePath),
  });

  console.log(`Imported: ${filePath} with nam = ${year}`);
}

// Import all CSV files in the directory
async function importAllCSVs() {
    const csvDir = path.join(__dirname, "../csv-file");
    const files = fs
        .readdirSync(csvDir)
        .filter((file) => file.endsWith(".csv"));

    for (const file of files) {
        const fullPath = path.join(csvDir, file);
        try {
            await importCSV(fullPath);
        } catch (err) {
            console.error(`Error importing ${file}:`, err.message);
        }
    }

    console.log("All CSV files processed.");
}

// Run the entire process
async function loadData() {
  await waitForMySQL();
  await initDatabase();
  await importAllCSVs();
}

module.exports = loadData;
