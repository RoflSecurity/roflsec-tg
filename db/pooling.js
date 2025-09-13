const mysql = require("mysql");
require("dotenv").config();

const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

async function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) return reject(err);
      try {
        connection.query(sql, params, (error, results) => {
          if (error) reject(error);
          else resolve(results);
        });
      } catch (e) {
        reject(e);
      } finally {
        connection.release();
      }
    });
  });
}

module.exports = { query, pool };
