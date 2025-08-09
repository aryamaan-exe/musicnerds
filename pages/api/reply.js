import { pool } from "./utils/db";
import { authenticated } from "./utils/auth";

export default async function handler(req, res) {
    if (req.method === "POST") {
        let { username, content, postID } = req.body;
        postID = parseInt(postID);
        const authToken = req.headers.authorization?.split(" ")[1];

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

            const userID = userResult.rows[0].id;

            await pool.query("INSERT INTO replies (postid, id, content) VALUES ($1, $2, $3)",
                [postID, userID, content ]
            )
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Failed to update profile picture" });
        }
    } else {
        res.status(405).json({ message: "Method Not Allowed" });
    }
}