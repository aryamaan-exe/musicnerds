import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";

export function useAlbumSearch(apiKey) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    const queryRef = useRef(query);
    useEffect(() => {
        if (!query || query.trim() === "") return;
        queryRef.current = query;
        setResults([]);
        setPage(1);
        setHasMore(true);
        loadMore();
    }, [query]);

    const handleSearch = useCallback(async (newQuery) => {
        if (!newQuery) return;
        setQuery(newQuery);
    }, []);

    const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
        const response = await axios.get(
            `https://ws.audioscrobbler.com/2.0/?method=album.search&album=${encodeURIComponent(queryRef.current)}&api_key=${apiKey}&limit=10&page=${page}&format=xml`
        );
        const parser = new DOMParser();
        const albumsXML = parser.parseFromString(response.data, "application/xml").querySelectorAll("album");
        const newAlbums = [];
        albumsXML.forEach(album => {
        const name = album.querySelector("name")?.textContent;
        const artist = album.querySelector("artist")?.textContent;
        const url = album.querySelectorAll("image")[2]?.textContent;
        newAlbums.push({ name, artist, url });
        });

        setResults(prev => [...prev, ...newAlbums]);
        setHasMore(newAlbums.length > 0);
        setPage(prev => prev + 1);
    } catch (err) {
        console.error("Search error", err);
        setHasMore(false);
    } finally {
        setLoading(false);
    }
    }, [apiKey, page, hasMore, loading]);

    return { results, loading, hasMore, handleSearch, loadMore };
}