import bcrypt from "bcrypt";
import { getAuthToken } from "./utils/auth";
import { pool } from "./utils/db";

export default async function handler(req, res) {
  if (req.method === "POST") {
    let { username, email, password } = req.body;

    username = username.trim().toLowerCase();
    email = email.trim().toLowerCase();
    if (3 > username.length || username.length > 15)
    {
      res.status(500).json({ error: "Username must be between 3 to 15 characters long." });
    }

    const regex = /[^a-zA-Z0-9\-_.]/g;
    const regex2 = /[a-zA-Z]/;
    if (username.match(regex))
    {
      res.status(500).json({ error: "Username cannot have any special characters except .-_" });
    }
    if (!regex2.test(username))
    {
      res.status(500).json({ error: "Username must have at least one letter." });  
    } 

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await pool.query(
        "INSERT INTO users (username, password, email, bio, pfp) VALUES ($1, $2, $3, '', 'https://res.cloudinary.com/dxpihu5ac/image/upload/v1708642351/default_pfp.png') RETURNING id",
        [username, hashedPassword, email]
      );

      const userId = result.rows[0].id;

      await pool.query(
        "INSERT INTO mtrush (id, first, second, third, fourth) VALUES ($1, '', '', '', '')",
        [userId]
      );

      const authToken = getAuthToken(username);

      res.status(200).json({
        message: "User registered successfully",
        authToken: authToken
      });
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