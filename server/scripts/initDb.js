const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "../db/sample.db");
const initSql = fs.readFileSync(path.join(__dirname, "../db/init_db.sql"), "utf8");

const db = new sqlite3.Database(dbPath);

db.exec(initSql, (err) => {
  if (err) {
    console.error("DB 초기화 실패:", err.message);
  } else {
    console.log("✅ DB 초기화 완료 (샘플 데이터 포함)");
  }
  db.close();
});
