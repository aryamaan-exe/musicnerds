import { Navbar } from "../components/navbar";
import { Footer } from "../components/footer";
import { useRouter } from "next/router";
import { SearchBar } from "../components/searchbar";
import { AlbumResults } from "../components/albumresults";
import { useAlbumSearch } from "./albumsearch";
import axios from "axios";

export function SearchIcon() {
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
}

export default function MountRushmore() {
    axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL;

    const router = useRouter();
    const username = typeof window !== "undefined" ? localStorage.getItem("username") : "";
    const authToken = typeof window !== "undefined" ? localStorage.getItem("authToken") : "";
    const spot = Number(router.query.spot) || 0;

    const {
        results,
        loading,
        hasMore,
        handleSearch,
        loadMore
    } = useAlbumSearch(process.env.NEXT_PUBLIC_LASTFM_KEY);

    const onSearch = (q) => handleSearch(q);
    const onAdd = async (albumUrl) => {
        await axios.post("/updateMtRush", { username, authToken, i: spot, album: albumUrl });
        router.push(`/users/${username}`);
    };

    return <>
        <Navbar />
        <div className="min-h-[85vh]">
            <div className="flex justify-center my-8">
            <div>
                <h2>Editing Mount Rushmore</h2>
                <SearchBar onSearch={onSearch} loading={loading} />
            </div>
            </div>
            <AlbumResults
            results={results}
            loading={loading}
            hasMore={hasMore}
            onLoadMore={loadMore}
            onAdd={onAdd}
            />
        </div>
        <Footer />
    </>
}