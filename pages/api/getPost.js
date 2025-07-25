import { pool } from "./utils/db";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { url } = req.query;

    try {
      const feedResult = await pool.query(
        "SELECT f.postid, f.title, f.body, f.image, f.timestamp, COUNT(l.postid) AS likes, f.url FROM feed f LEFT JOIN likes l ON f.postid = l.postid WHERE f.url=$1 GROUP BY f.postid, f.title, f.body, f.image, f.timestamp",
        [url]
      );

      res.status(200).json({
        message: "Obtained feed",
        post: feedResult.rows[0],
      });
    } catch (error) {
      console.error("Feed retrieval error:", error);
      res.status(500).json({ error: "Failed to query database" });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}