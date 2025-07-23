import { authenticated } from "./utils/auth";
import { pool } from "./utils/db";



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