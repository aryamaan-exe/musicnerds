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
    const { username, authToken, i, album } = req.body;

    try {
      const auth = await authenticated(username, authToken, pool);
      if (!auth) {
        res.status(401).json({ error: "Unauthorized request" });
        return;
      }

      const userResult = await pool.query(
        "SELECT id FROM users WHERE username=$1",
        [username]
      );
      const userId = userResult.rows[0].id;

      let indexColumn = "";
      switch (i) {
        case 1:
          indexColumn = "first";
          break;
        case 2:
          indexColumn = "second";
          break;
        case 3:
          indexColumn = "third";
          break;
        case 4:
          indexColumn = "fourth";
          break;
        default:
          res.status(400).json({ error: "Invalid index for Mt. Rushmore" });
          return;
      }

      await pool.query(
        `UPDATE mtRush SET ${indexColumn}=$1 WHERE id=$2`,
        [album, userId]
      );

      res.status(200).json({
        message: "Updated Mt. Rushmore",
      });
    } catch (error) {
      console.error("Update Mt. Rushmore error:", error);
      res.status(500).json({ error: "Couldn't update album" });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}