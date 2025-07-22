import { Pool } from "pg";
import crypto from "crypto";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const pool = new Pool({
  connectionString: process.env.URL,
});

function getAuthToken(password, username) {
  const salt = process.env.SALT || "";
  const hash = crypto.createHash("sha256");
  hash.update(password + username + salt);
  return hash.digest("hex");
}

async function authenticated(username, authToken, db) {
  const rows = await db.query("SELECT password FROM users WHERE username=$1", [username]);
  if (rows.rows.length === 0) {
    return false;
  }
  const password = rows.rows[0].password;
  const token = getAuthToken(password, username);
  return token === authToken;
}

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { username, authToken, pfp } = req.body;

    try {
      const auth = await authenticated(username, authToken, pool);
      if (!auth) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const uploadResult = await cloudinary.uploader.upload(pfp, {
        folder: "profile_pictures",
      });

      await pool.query(
        "UPDATE users SET pfp = $1 WHERE username = $2",
        [uploadResult.secure_url, username]
      );

      res.status(200).json({ message: "Profile picture updated successfully" });
    } catch (error) {
      console.error("PFP update error:", error);
      res.status(500).json({ error: "Failed to update profile picture" });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}