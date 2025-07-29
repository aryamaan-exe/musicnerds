import jwt from "jsonwebtoken";
import { pool } from "./utils/db";

export default async function handler(req, res) {
    if (req.method === "GET") {
    const { username, authToken, currentUsername } = req.query;
    let following;

    try {
        const userResult = await pool.query(
        "SELECT bio, pfp, id FROM users WHERE username=$1",
        [username]
        );      

        if (userResult.rows.length === 0) {
        res.status(404).json({ error: "User not found" });
        return;
        }

        const { bio, pfp, id } = userResult.rows[0];
        let followResult = await pool.query(
        "SELECT * FROM follow WHERE followee=$1",
        [id]
        );
        const followers = followResult.rows.length;

        if (currentUsername) {
        const currentUserResult = await pool.query(
            "SELECT id FROM users WHERE username=$1",
            [currentUsername]
        );
        const currentUserID = currentUserResult.rows[0].id;
        followResult = await pool.query(
            "SELECT * FROM follow WHERE follower=$1 AND followee=$2",
            [currentUserID, id]
        );
        console.log(currentUserID, followResult.rows);
        following = (followResult.rows.length);
        }

        let isMe;
        if (authToken) {
        try {
            const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
            // better than username == currentUsername because local storage can be changed by the user
            if (decoded.username === username) {
            isMe = true;
            }
        } catch (err) {
            isMe = false;
        }
        }

        res.status(200).json({ bio, pfp, me: isMe, following, followers });

    } catch (error) {
        console.error("User retrieval error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
    } else {
        res.status(405).json({ message: "Method Not Allowed" });
    }
}