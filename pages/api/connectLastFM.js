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

    lfm.authenticate(token, function (err, session) {
      if (err) {console.log(err)};
      res.status(200).json({key: session.key, lfmUsername: session.username});
    });
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}