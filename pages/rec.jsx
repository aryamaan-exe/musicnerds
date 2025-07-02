import { Navbar } from "../components/navbar";
import { Footer } from "../components/footer";
import { Card, CardBody, CardFooter, Input, Button } from "@heroui/react";
import { SearchBar } from "../components/searchbar";
import { AlbumResults } from "../components/albumresults";
import { useAlbumSearch } from "./albumsearch";
import { useState } from "react";
import axios from "axios";

export default function Rec() {
    // const [postContent, setPostContent] = useState("");
    const {
        results,
        loading,
        hasMore,
        handleSearch,
        loadMore
    } = useAlbumSearch(process.env.NEXT_PUBLIC_LASTFM_KEY);

    const onSearch = (q) => handleSearch(q);
    const timestamp = (new Date()).toISOString();
    const onAdd = async (albumUrl) => {
        await axios.post("/post", { username, authToken, timestamp, image: albumUrl });
        router.push(`/users/${username}`);
    };

    return <>
        <Navbar />
        <div className="flex flex-col h-[85vh] m-8 items-center">
            <h1 className="mb-16">Recommend an album</h1>
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
    </>
}