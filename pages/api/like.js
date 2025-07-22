import { Pool } from "pg";
import crypto from "crypto";

const pool = new Pool({
  connectionString: process.env.URL,
});

function getAuthToken(password, username) {
  const salt = process.env.SALT || "";
  const hash = crypto.createHash("sha256");
  hash.update(password + username + salt);
  return hash.digest("hex");
}

async function authenticated(username, authToken, db) {
  const rows = await db.query("SELECT password FROM users WHERE username=$1", [username]);
  if (rows.rows.length === 0) {
    return false;
  }
  const password = rows.rows[0].password;
  const token = getAuthToken(password, username);
  return token === authToken;
}

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { username, authToken, postID, remove } = req.body;

    try {
      const auth = await authenticated(username, authToken, pool);
      if (!auth) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const userResult = await pool.query(
        "SELECT id FROM users WHERE username=$1",
        [username]
      );
      const userId = userResult.rows[0].id;

      if (remove) {
        await pool.query(
          "DELETE FROM likes WHERE postid=$1 AND id=$2",
          [postID, userId]
        );
      } else {
        await pool.query(
          "INSERT INTO likes (postid, id) VALUES ($1, $2)",
          [postID, userId]
        );
      }

      res.status(200).json({ message: "Post liked" });
    } catch (error) {
      console.error("Like/Unlike error:", error);
      res.status(500).json({ error: "Failed to query database" });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}