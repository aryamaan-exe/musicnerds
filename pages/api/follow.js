import { authenticated } from "./utils/auth";
import { pool } from "./utils/db";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { username, authToken, userToFollow, remove } = req.body;
    
    try {
        const auth = await authenticated(username, authToken, pool);
        if (!auth) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        let userResult = await pool.query(
            "SELECT id FROM users WHERE username=$1",
            [username]
        );
        const followerId = userResult.rows[0].id;

        userResult = await pool.query(
            "SELECT id FROM users WHERE username=$1",
            [userToFollow]
        );
        const followeeId = userResult.rows[0].id;

        if (remove) {
            await pool.query(
                "DELETE FROM follow WHERE follower=$1 AND followee=$2",
                [followerId, followeeId]
            );
        } else {
            console.log('vvvv');
            await pool.query(
                "INSERT INTO follow VALUES ($1, $2)",
                [followerId, followeeId]
            );
        }

        res.status(200).json({ message: `User ${remove ? 'un' : ''}followed` });
    } catch (error) {
        console.error("Follow/Unfollow error:", error);
        res.status(500).json({ error: "Failed to query database" });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}