import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Button } from "@heroui/react";
import { SearchBar } from "../components/searchbar";
import { AlbumResults } from "../components/albumresults";
import { useAlbumSearch } from "../hooks/albumsearch";
import { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

export function RecModal({ isOpen, onOpenChange }) {
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
    const onAdd = async (album) => {
        await axios.post("/api/post", { 
            username,
            authToken,
            "image": album.url,
            "title": `Listen to ${album.name}`,
            "body": `${username} recommends ${album.name} by ${album.artist}.`
        });
        router.reload();
    };

    return <Modal className="max-h-[75vh] min-w-[75vw]" isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    <ModalHeader>Recommend an Album</ModalHeader>
                    <ModalBody className="max-h-[75vh] overflow-y-auto">
                        <SearchBar onSearch={onSearch} loading={loading} />
                    
                        <div className="overflow-y-auto">
                            <AlbumResults
                                results={results}
                                loading={loading}
                                hasMore={hasMore}
                                onLoadMore={loadMore}
                                onAdd={onAdd}
                            />
                        </div>
                    </ModalBody>
                </ModalContent>
            </Modal>
}