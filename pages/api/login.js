import bcrypt from "bcrypt";
import { Pool } from "pg";
import crypto from "crypto";

const pool = new Pool({
  connectionString: process.env.URL,
});

function getAuthToken(password, username) {
  const salt = process.env.SALT || "";
  const hash = crypto.createHash("sha256");
  hash.update(password + username + salt);
  return hash.digest("hex");
}

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

      const authToken = getAuthToken(hashedPassword, username);

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