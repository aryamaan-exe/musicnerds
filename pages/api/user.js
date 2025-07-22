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

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { username, authToken } = req.query;

    try {
      const userResult = await pool.query(
        "SELECT bio, pfp, password FROM users WHERE username=$1",
        [username]
      );

      if (userResult.rows.length === 0) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const { bio, pfp, password } = userResult.rows[0];

      let isMe = false;
      if (authToken) {
        const expectedAuthToken = getAuthToken(password, username);
        if (expectedAuthToken === authToken) {
          isMe = true;
        }
      }

      res.status(200).json({ bio, pfp, me: isMe });

    } catch (error) {
      console.error("User retrieval error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}