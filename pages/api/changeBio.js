import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.URL,
});

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { username, bio } = req.body;

    if (!bio || bio.trim() === '') {
      return res.status(400).json({ error: "Bio cannot be empty" });
    }

    try {
      await pool.query(
        "UPDATE users SET bio=$1 WHERE username=$2",
        [bio, username]
      );

      res.status(200).json({
        message: "Bio updated",
        bio: bio,
      });
    } catch (error) {
      console.error("Failed to update bio:", error);
      res.status(500).json({ error: "Failed to update bio in database" });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}