import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export function getAuthToken(username) {
  const jwt = require("jsonwebtoken");
  return jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: "24h" });
}

export async function authenticated(username, authToken, db) {
  const jwt = require("jsonwebtoken");
  try {
    const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
    if (decoded.username === username) {
      const user = await db.query("SELECT * FROM users WHERE username = $1", [username]);
      if (user.rows.length > 0) {
        return true;
      }
    }
  } catch (err) {
    console.error("Authentication error:", err);
  }
  return false;
}