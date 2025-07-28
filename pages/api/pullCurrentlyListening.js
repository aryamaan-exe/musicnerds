import LastfmAPI from "lastfmapi";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { lfmUsername } = req.query;

    let lfm = new LastfmAPI({
      "api_key" : process.env.LASTFM_KEY,
      "secret" : process.env.LASTFM_SECRET
    });

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