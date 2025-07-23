import { pool } from "./utils/db";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { username } = req.query;

    try {
      const userResult = await pool.query(
        "SELECT id FROM users WHERE username=$1",
        [username]
      );

      if (userResult.rows.length === 0) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const userId = userResult.rows[0].id;

      const likesResult = await pool.query(
        "SELECT postid FROM likes WHERE id=$1",
        [userId]
      );

      const likes = likesResult.rows.map((row) => row.postid);

      res.status(200).json({ likes });
    } catch (error) {
      console.error("Likes retrieval error:", error);
      res.status(500).json({ error: "Error querying database" });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}