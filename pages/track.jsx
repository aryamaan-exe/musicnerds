import { Navbar } from "../components/navbar";
import { Footer } from "../components/footer";
import { Card, CardBody, CardFooter, Input, Button } from "@heroui/react";
import { SearchBar } from "../components/searchbar";
import { AlbumResults } from "../components/albumresults";
import { useAlbumSearch } from "./albumsearch";
import { useRouter } from "next/router";
import axios from "axios";

export default function Rec() {
    axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL;
    const username = typeof window !== "undefined" ? localStorage.getItem("username") : "";
    const authToken = typeof window !== "undefined" ? localStorage.getItem("authToken") : "";
    const router = useRouter();
    const {
        results,
        loading,
        hasMore,
        handleSearch,
        loadMore
    } = useAlbumSearch(process.env.NEXT_PUBLIC_LASTFM_KEY);

    const onSearch = (q) => handleSearch(q);
    const timestamp = (new Date()).toISOString();
    const onAdd = async (album) => {
        await axios.post("/post", { 
            username,
            authToken,
            timestamp,
            "image": album.url,
            "title": `Just listened to ${album.name}`,
            "body": `${username} listened to ${album.name} by ${album.artist}`
        });
        router.push(`/users/${username}`);
    };

    return <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex flex-col h-[85vh] m-8 items-center">
            <h1 className="mb-16">Track an album listen</h1>
            <Card className="w-[75%] overflow-y-auto">
                <CardBody className="min-h-fit">
                    <SearchBar onSearch={onSearch} loading={loading} />
                    
                    <AlbumResults
                        results={results}
                        loading={loading}
                        hasMore={hasMore}
                        onLoadMore={loadMore}
                        onAdd={onAdd}
                    />
                </CardBody>
            </Card>
            
        </div>
        <Footer />
    </div>
}