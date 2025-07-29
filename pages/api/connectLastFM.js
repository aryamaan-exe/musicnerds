import LastfmAPI from "lastfmapi";
import { pool } from "./utils/db";
import { authenticated } from "./utils/auth";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { username, authToken, token } = req.query;

    // authToken = musicnerds token, token = lastfm token
    const auth = await authenticated(username, authToken, pool);
    if (!auth) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    let lfm = new LastfmAPI({
      "api_key" : process.env.LASTFM_KEY,
      "secret" : process.env.LASTFM_SECRET
    });

    lfm.authenticate(token, async (err, session) => {
      if (err) {console.log(err)};
      const lfmUsername = session.username;
      const key = session.key;
      
      const userResult = await pool.query(
        "SELECT id FROM users WHERE username=$1",
        [username]
      );

      if (userResult.rows.length === 0) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const userId = userResult.rows[0].id;

      await pool.query("DELETE FROM lastfm WHERE id=$1", [userId]);
      await pool.query("INSERT INTO lastfm VALUES ($1, $2, $3)", [userId, lfmUsername, key]);
      res.status(200).json({key, lfmUsername});
    });
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}