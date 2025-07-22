import bcrypt from "bcrypt";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.URL,
});

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { username, email, password } = req.body;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await pool.query(
        "INSERT INTO users (username, password, email, bio, pfp) VALUES ($1, $2, $3, '', 'https://images.unsplash.com/broken') RETURNING id",
        [username, hashedPassword, email]
      );

      const userId = result.rows[0].id;

      await pool.query(
        "INSERT INTO mtrush (id, first, second, third, fourth) VALUES ($1, '', '', '', '')",
        [userId]
      );

      res.status(200).json({ message: "User registered successfully" });
    } catch (error) {
      if (error.code === "23505") {
        res.status(500).json({ error: "Username is taken, choose another" });
      } else {
        console.error("Registration error:", error);
        res.status(500).json({ error: "Error adding to database" });
      }
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}