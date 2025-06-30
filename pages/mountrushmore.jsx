import { Navbar } from "../components/navbar";
import { Footer } from "../components/footer";
import { useRouter } from "next/router";
import { useEffect, useState, useRef, useCallback } from "react";
import { Image, Card, CardBody, Button, Input, Spinner } from "@heroui/react";
import { Add } from "./users/[username]";
import axios from "axios";

function SearchIcon() {
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
}

export default function MountRushmore() {
    axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL;

    const router = useRouter();
    const [username, setUsername] = useState("");
    const [authToken, setAuthToken] = useState("");
    const [spot, setSpot] = useState(router.query.spot);
    const [query, setQuery] = useState("");
    const queryRef = useRef(query);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(3);
    const observer = useRef();

    const lastCardRef = useCallback((node) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(async (entries) => {
            if (entries[0].isIntersecting) {
               await loadMoreItems();
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    const loadMoreItems = async () => {
        if (loading || !hasMore) return;
        setLoading(true);
        const newItems = (await handleSearch(queryRef.current, page));
        const updated = [...results, ...newItems];
        setResults(updated);

        if (page === 5) {
            setHasMore(false);
        }
        
        setPage(page + 1);
        setLoading(false);
    };

    async function handleSearch(query, page) {
        try {
            const response = await axios.get(`https://ws.audioscrobbler.com/2.0/?method=album.search&album=${query}&api_key=${process.env.NEXT_PUBLIC_LASTFM_KEY}&limit=10&page=${page}&format=xml`)
            const parser = new DOMParser();
            const parsedContent = parser.parseFromString(response.data, "application/xml").querySelectorAll("album");
            const albums = [];
            for (let i = (parsedContent.length == 10 ? 0 : 10); i < (parsedContent.length == 10 ? 10 : 20); i++) {
                const album = parsedContent[i];
                const name = album.querySelector("name").textContent;
                const artist = album.querySelector("artist").textContent;
                const url = album.querySelectorAll("image")[2].textContent;
                
                albums.push({ name, artist, url });
            }
            return albums;
        } catch (err) {
            return err.response.data.message;
        }
    }

    async function updateMtRush(username, authToken, i, album) {
        try {
            const response = axios.post("/updateMtRush", {
                username: username,
                authToken: authToken,
                i: i,
                album: album
            });

            return response;
        } catch (err) {
            if (err.response) {
                return { success: false, status: err.response.status, error: err.response.data.error };
            } else {
                return { success: false, error: err.message };
            }
        }
    }

    useEffect(() => {
        if (!router.query.spot) return;
        setSpot(parseInt(router.query.spot));
    }, [router.query.spot])

    useEffect(() => {
        queryRef.current = query;
        setResults([]);
    }, [query]);

    useEffect(() => {
        if (window.localStorage.getItem("username") == "") return;
        setUsername(window.localStorage.getItem("username"));
        setAuthToken(window.localStorage.getItem("authToken"));
    })

    return <>
        <Navbar />
        <div className="h-[85vh]">
            <div className="flex justify-center my-8">
                <div>
                    <h2>Editing Mount Rushmore</h2>
                    <div className="flex gap-2">
                        <Input startContent={SearchIcon()} onChange={(e) => {
                            setQuery(e.target.value);
                        }}></Input>
                        <Button color="secondary" onPress={async () => {
                            setLoading(true);
                            setResults((await handleSearch(query, 1)));
                            setLoading(false);
                        }}>Search</Button>
                    </div>
                </div>
            </div>
            <div className="flex flex-col min-h-screen m-4 justify-center items-center *:w-[75%]">
                {results.map((album, index) => {
                    if (results.length === index + 1) {
                        return (<Card key={index} className="m-1">
                                    <CardBody className="flex flex-row gap-8">
                                        <Image src={album.url} width={150} height={150}></Image>
                                        <div>
                                            <h3 className="text-xl font-bold mb-4">{album.name}</h3>
                                            <p className="text-lg mb-4">{album.artist}</p>
                                            <Button color="secondary" onPress={() => {
                                                updateMtRush(username, authToken, spot, album.url)
                                                router.push(`/users/${username}`)
                                            }}><Add />Add</Button>
                                        </div>
                                    </CardBody>
                                    <div ref={lastCardRef}></div>
                                </Card>)
                    } else {
                        return (<Card key={index} className="m-1">
                                    <CardBody className="flex flex-row gap-8">
                                        <Image src={album.url} width={150} height={150}></Image>
                                        <div>
                                            <h3 className="text-xl font-bold mb-4">{album.name}</h3>
                                            <p className="text-lg mb-4">{album.artist}</p>
                                            <Button color="secondary" onPress={() => {
                                                updateMtRush(username, authToken, spot, album.url);
                                                router.push(`/users/${username}`)
                                            }}><Add />Add</Button>
                                        </div>
                                    </CardBody>
                                </Card>)
                    }
                })}
                {loading && <Spinner size="lg" className="mt-4" color="secondary" />}
            </div>

            <Footer></Footer>
        </div>
    </>
}