import { Navbar } from "../components/navbar";
import { Footer } from "../components/footer";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Image, Card, CardBody, Button, Input } from "@heroui/react";
import { Add } from "./users/[username]";
import axios from "axios";
import { parse } from "path";

function SearchIcon() {
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
}

export default function MountRushmore() {
    const router = useRouter();
    const [index, setIndex] = useState(1);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);

    async function handleSearch(query) {
        try {
            const response = await axios.get(`https://ws.audioscrobbler.com/2.0/?method=album.search&album=${query}&api_key=${process.env.NEXT_PUBLIC_LASTFM_KEY}&format=xml`)
            const parser = new DOMParser();
            const parsedContent = parser.parseFromString(response.data, "application/xml").querySelectorAll("album");
            const albums = [];
            for (let i = 0; i < parsedContent.length; i++) {
                const album = parsedContent[i];
                const name = album.querySelector("name").textContent;
                const artist = album.querySelector("artist").textContent;
                const url = album.querySelectorAll("image")[2].textContent;
                
                albums.push({ name, artist, url });
            }
            return albums;
        } catch (err) {
            console.log(err);
            return err.response.data.message;
        }
    }

    useEffect(() => {
        if (!router.query.spot) return;
        setIndex(router.query.spot);
    }, [router.query.spot])

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
                            setResults((await handleSearch(query)));
                            console.log(await handleSearch(query));
                        }}>Search</Button>
                    </div>
                </div>
            </div>
            <div className="flex flex-col m-4 justify-center items-center *:w-[75%]">
                {results.map((album) => {
                    return (<Card className="m-1">
                    <CardBody className="flex flex-row gap-8">
                        <Image fallbackSrc="https://raw.githubusercontent.com/aryamaan-exe/musicnerds/refs/heads/main/pages/fallback.png" src={album.url} width={150} height={150}></Image>
                        <div>
                            <h3 className="text-xl font-bold mb-4">{album.name}</h3>
                            <p className="text-lg mb-4">{album.artist}</p>
                            <Button color="secondary"><Add />Add</Button>
                        </div>
                    </CardBody>
                </Card>)
                })}
            </div>
        </div>

        <Footer></Footer>
    </>
}