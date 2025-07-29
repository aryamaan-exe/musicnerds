import jwt from "jsonwebtoken";
import { pool } from "./db";

export function getAuthToken(username) {
  return jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: "999h" });
}

export async function authenticated(username, authToken, db) {
  try {
    const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
    if (decoded.username === username) {
      const user = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
      if (user.rows.length > 0) {
        return true;
      }
    }
  } catch (err) {
    console.error("Authentication error:", err);
  }
  return false;
}