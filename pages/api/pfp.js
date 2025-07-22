import { Pool } from "pg";
import { v2 as cloudinary } from "cloudinary";
import { getAuthToken, authenticated } from "./utils/auth";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req, res) {
  if (req.method === "POST") {
    let { username, pfp } = req.body;
    const authToken = req.headers.authorization?.split(' ')[1];

    try {
      const auth = await authenticated(username, authToken, pool);
      if (!auth) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }


      try {
            if (pfp && typeof pfp === 'string' && !pfp.startsWith("data:image")) {
                pfp = `data:image/png;base64,${pfp}`;
            }

            const uploadResult = await cloudinary.uploader.upload(pfp, {
        folder: "profile_pictures",
      });

      await pool.query(
        "UPDATE users SET pfp = $1 WHERE username = $2",
        [uploadResult.secure_url, username]
      );


      res.status(200).json({ message: "Profile picture updated successfully", pfp: uploadResult.secure_url });
      } catch (cloudinaryError) {
        console.error("Cloudinary Error:", cloudinaryError.message || cloudinaryError.data || cloudinaryError.response || 'Failed to upload image');
        res.status(500).json({ error: "Failed to upload image to Cloudinary" });
        return;
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to update profile picture" });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}