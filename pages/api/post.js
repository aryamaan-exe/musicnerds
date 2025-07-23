import { getAuthToken, authenticated } from "./utils/auth";
import { pool } from "./utils/db";



export default async function handler(req, res) {
  if (req.method === "POST") {
    const { username, authToken, title, body, image } = req.body;

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

      await pool.query(
        "INSERT INTO feed (id, title, body, image, timestamp) VALUES ($1, $2, $3, $4, NOW())",
        [userId, title, body, image]
      );

      res.status(200).json({ message: "Post added" });
    } catch (error) {
      console.error("Post creation error:", error);
      res.status(500).json({ error: "Failed to query database" });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}