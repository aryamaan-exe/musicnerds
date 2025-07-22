import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { username, authToken } = req.query;

    const jwt = require("jsonwebtoken");

    try {
      const userResult = await pool.query(
        "SELECT bio, pfp FROM users WHERE username=$1",
        [username]
      );

      if (userResult.rows.length === 0) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const { bio, pfp } = userResult.rows[0];

      let isMe = false;
      if (authToken) {
        try {

          const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
          if (decoded.username === username) {
            isMe = true;
          }
        } catch (err) {
          console.error("Token verification error:", err);
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