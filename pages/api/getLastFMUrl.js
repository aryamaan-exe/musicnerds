import LastfmAPI from "lastfmapi";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { username } = req.query;

    let lfm = new LastfmAPI({
      "api_key" : process.env.LASTFM_KEY,
      "secret" : process.env.LASTFM_SECRET
    });

    let url = lfm.getAuthenticationUrl({"cb": `${process.env.FRONTEND_URL}/connected` });
    console.log(url);
    
    res.status(200).json({ url });
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}