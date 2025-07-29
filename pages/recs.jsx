import { Footer } from "@/components/footer";
import { Navbar } from "../components/navbar";
import { useEffect, useState } from "react";
import { LastFMButton } from "./users/[username]";
import { Card, CardBody, CardHeader, Image, Skeleton } from "@heroui/react";
import { getLastFMUrl } from "./users/[username]";
import axios from "axios";

export default function Recs() {
    async function getRecommendations(lfmUsername, setState) {
        try {
            const response = await axios.get("/api/recommendations", {
                params: { lfmUsername }
            });
            
            return response.data;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    const [lastFMConnected, setLastFMConnected] = useState(false);
    const [lastFMUrl, setLastFMUrl] = useState("");
    const [recommendations, setRecommendations] = useState([]);
    const [recsLoaded, setRecsLoaded] = useState(false);

    useEffect(() => {
        async function x() {
            if (!window.localStorage.getItem("authToken")) return;
            if (window.localStorage.getItem("lastFMSessionKey")) {
                setLastFMConnected(true);
            } else {
                setLastFMUrl((await getLastFMUrl(window.localStorage.getItem("username"))).url);
            }
        }
        x();
    }, []);

    useEffect(() => {
        async function x() {
            if (!lastFMConnected) return;
            const recommendations = await getRecommendations(window.localStorage.getItem("lastFMUsername", setRecsLoaded));
            setRecsLoaded(true);
            setRecommendations(recommendations);
        }
        x();
    }, [lastFMConnected]);

    return (
        <>
            <Navbar />
                { lastFMConnected ? 
                <>
                    <div className="flex justify-center items-center my-8 mx-4">
                        <div className="flex flex-col">
                            {recsLoaded ? recommendations.map((album) => {
                                return <div className="mb-4">
                                            <Card>
                                                <CardHeader className="flex-row items-start">
                                                    <Image src={album.url} />
                                                    <div className="ml-8">
                                                        <h3 className="text-xl font-bold">{album.title}</h3>
                                                        <h4 className="text-xl">{album.artist}</h4>
                                                    </div>
                                                </CardHeader>
                                            </Card>
                                        </div>
                            }) : 
                                Array(10).fill(1).map((_, i) => {
                                    return <Skeleton className="rounded-3xl mb-4">
                                        <Card className="h-[20vh]">
                                            <CardHeader className="flex-row items-start">
                                                    <Image src={""} width={"50%"} height={"50%"} />
                                                    <div className="">
                                                        <h3 className="text-xl font-bold">Lorem ipsum</h3>
                                                    </div>
                                            </CardHeader>
                                            <CardBody className="flex-row items-center gap-4">
                                                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                                                <p>Sed in lectus quis elit viverra volutpat.</p>
                                                <p>27139471</p>
                                            </CardBody>
                                        </Card>
                                    </Skeleton>
                                })
                            }
                        </div>
                    </div>
                </>
                : 
                    <div className="flex lg:ml-64 ml-8 items-center h-[85vh]">
                        <div>
                            <h1>Connect your Last.fm</h1>
                            <p className="mb-4">You need to connect your Last.fm account to get personalized recommendations.</p>
                            <a href={lastFMUrl}><LastFMButton /></a>
                        </div>
                    </div>
                }
            <Footer />
        </>
    );
}