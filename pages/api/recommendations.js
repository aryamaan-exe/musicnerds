import { GoogleGenerativeAI } from '@google/generative-ai';
import LastfmAPI from "lastfmapi";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { lfmUsername } = req.query;

    let lfm = new LastfmAPI({
      "api_key" : process.env.LASTFM_KEY,
      "secret" : process.env.LASTFM_SECRET
    });

    const promisifyLfm = (method, context, params) => {
      return new Promise((resolve, reject) => {
        method.call(context, params, (err, result) => {
          if (err) {
            console.error(err);
            return reject(err);
          }
          resolve(result);
        });
      });
    };

    try {
      const topTracks = await promisifyLfm(lfm.user.getTopTracks, lfm.user, { user: lfmUsername, period: "7day", limit: 5 });
      const topTrackNames = topTracks.track.map(track => `${track.name} by ${track.artist.name}`);

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash"});

      const prompt = `Given the user's top tracks: ${topTrackNames.join(", ")}. Recommend 10 similar albums AND DO NOT USE ANY ARTISTS FROM THE LIST. Try to find recommendations that are a bit more underground but still within the same genre/subgenre. Provide the output as a JSON array of objects, where each object has "title", "artist" properties. For example: [{"title": "Album Title", "artist": "Artist Name"}].`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      let text = response.text();
      if (text.startsWith("```json")) {
        text = text.substring(7, text.lastIndexOf("```"));
      }

      let recommendations;
      try {
        recommendations = JSON.parse(text);
      } catch (parseError) {
        console.error("Failed to parse Gemini API response as JSON:", text, parseError);
        return res.status(500).json({ message: "Failed to get valid recommendations from AI." });
      }

      for (let i = 0; i < recommendations.length; i++) {
        const album = recommendations[i];
        try {
          const albumInfo = await promisifyLfm(lfm.album.getInfo, lfm.album, { artist: album.artist, album: album.title });
          if (albumInfo.error === 6) {
            recommendations.splice(i, 1);
            i--;
            continue;
          }
          const url = albumInfo.image[2]["#text"];
          recommendations[i] = {...album, url}
        } catch (error) {
          console.error(`Error fetching album info for ${album.title} by ${album.artist}:`, error);
          recommendations.splice(i, 1);
          i--;
        }
      }

      res.status(200).json(recommendations);
    } catch (error) {
      console.error("Error in recommendations API:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}