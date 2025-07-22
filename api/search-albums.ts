import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { query, page = 1 } = req.query;

  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: "Missing or invalid query" });
  }

  try {
    const lastfmKey = process.env.LASTFM_KEY;
    const url = new URL("https://ws.audioscrobbler.com/2.0/");
    url.searchParams.append("method", "album.search");
    url.searchParams.append("album", query);
    url.searchParams.append("api_key", lastfmKey!);
    url.searchParams.append("limit", "10");
    url.searchParams.append("page", page.toString());
    url.searchParams.append("format", "xml");

    const response = await axios.get(url.toString());

    res.status(200).send(response.data); 
  } catch (error) {
    console.error("Error fetching albums:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
