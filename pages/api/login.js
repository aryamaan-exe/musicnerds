import { Pool } from "pg";
import { getAuthToken } from "./utils/auth";
import bcrypt from "bcrypt";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});



export default async function handler(req, res) {
  if (req.method === "POST") {
    const { username, password } = req.body;

    try {
      const result = await pool.query(
        "SELECT password FROM users WHERE username=$1",
        [username]
      );

      if (result.rows.length === 0) {
        res.status(401).json({ error: "Incorrect username or password" });
        return;
      }

      const hashedPassword = result.rows[0].password;
      const passwordMatch = await bcrypt.compare(password, hashedPassword);

      if (!passwordMatch) {
        res.status(401).json({ error: "Incorrect username or password" });
        return;
      }

      const authToken = getAuthToken(username);

      res.status(200).json({
        message: "User logged in successfully",
        authToken: authToken,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}