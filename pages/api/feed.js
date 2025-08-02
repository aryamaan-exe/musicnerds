import { pool } from "./utils/db";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { username, page } = req.query;
    const pageNum = parseInt(page, 10);

    if (isNaN(pageNum) || pageNum < 1) {
      res.status(400).json({ error: "Invalid page number" });
      return;
    }

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
      const offset = (pageNum - 1) * 10;

      const feedResult = await pool.query(
        "SELECT postid, title, body, image, timestamp, likes, url, replies as replyCount FROM feed f WHERE id=$1 ORDER BY timestamp DESC LIMIT 10 OFFSET $2",
        [userId, offset]
      );

      res.status(200).json({
        message: "Obtained feed",
        posts: feedResult.rows,
      });
    } catch (error) {
      console.error("Feed retrieval error:", error);
      res.status(500).json({ error: "Failed to query database" });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}