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
      console.log(`⏳ Waiting for MySQL... retrying in ${delay / 1000}s (${retries} left)`);
      await new Promise(res => setTimeout(res, delay));
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
      to_hop_mon VARCHAR(255),
      diem FLOAT,
      ghi_chu TEXT
    )
  `;
  await pool.query(sql);
  console.log("Table 'majors' is ready.");
}

// Import 1 file CSV
async function importCSV(filePath) {
  const absolutePath = path.resolve(filePath);
  const sql = `
    LOAD DATA LOCAL INFILE 'dummy.csv' INTO TABLE majors
    FIELDS TERMINATED BY ',' 
    ENCLOSED BY '"' 
    LINES TERMINATED BY '\\n'
    IGNORE 1 LINES
    (ma_truong, ten_truong, dia_diem, ma_nganh, ten_nganh, to_hop_mon, diem, ghi_chu)
  `;

  await pool.query({
    sql,
    infileStreamFactory: () => fs.createReadStream(absolutePath),
  });

  console.log(`Imported: ${filePath}`);
}

// Import all CSV files in the directory
async function importAllCSVs() {
  const csvDir = path.join(__dirname, "../csv-file");
  const files = fs.readdirSync(csvDir).filter(file => file.endsWith(".csv"));

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
(async () => {
  try {
    await waitForMySQL();
    await initDatabase();
    await importAllCSVs();
    process.exit(0);
  } catch (err) {
    console.error("Unexpected error:", err);
    process.exit(1);
  }
})();
