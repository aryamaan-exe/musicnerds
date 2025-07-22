import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

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

      const mtRushResult = await pool.query(
        "SELECT first, second, third, fourth FROM mtRush WHERE id=$1",
        [userId]
      );

      if (mtRushResult.rows.length === 0) {
        res.status(404).json({ error: "Mt. Rushmore not found for this user" });
        return;
      }

      const { first, second, third, fourth } = mtRushResult.rows[0];

      res.status(200).json({
        message: "Obtained Mt. Rushmore",
        mtRush: [first, second, third, fourth],
      });
    } catch (error) {
      console.error("Mt. Rushmore retrieval error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}