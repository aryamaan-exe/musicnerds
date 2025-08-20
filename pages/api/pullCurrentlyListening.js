import LastfmAPI from "lastfmapi";
import { pool } from "./utils/db";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { username } = req.query;

    let lfm = new LastfmAPI({
      "api_key" : process.env.LASTFM_KEY,
      "secret" : process.env.LASTFM_SECRET
    });

    const userResult = await pool.query(
      "SELECT id FROM users WHERE username=$1",
      [username]
    );
    const id = userResult.rows[0].id;

    const lfmResult = await pool.query("SELECT * FROM lastfm WHERE id=$1", [id])
    if (!lfmResult.rows.length) {
      res.status(200).json({ message: 0 });
      return;
    }

    const lfmUsername = lfmResult.rows[0].lfmusername;

    lfm.user.getRecentTracks({user: lfmUsername, limit: 1}, (err, tracks) => {
      if (err) console.log(err);
      if (tracks.track[0]["@attr"]) {
        res.status(200).json({ message: "💿 Listening to " + tracks.track[0].name + " - " + tracks.track[0].artist["#text"]})
      } else {
        res.status(200).json({ message: "" });
      }
    });
    
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}