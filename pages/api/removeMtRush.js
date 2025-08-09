import { authenticated } from "./utils/auth";
import { pool } from "./utils/db";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { username, authToken, i } = req.body;

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
        `UPDATE mtRush SET ${indexColumn}='' WHERE id=$1`,
        [userId]
      );

      res.status(200).json({
        message: "Removed album from Mt. Rushmore",
      });
    } catch (error) {
      console.error("Remove Mt. Rushmore error:", error);
      res.status(500).json({ error: "Couldn't remove album" });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}