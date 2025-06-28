import { Navbar } from "../../components/navbar";
import { Footer } from "../../components/footer";
import { useRouter } from 'next/router';
import { Image, Avatar, Button, Card, CardHeader, CardBody, CardFooter, Skeleton } from "@heroui/react";
import { useState, useEffect, useRef, useCallback } from "react";

export function Add() {
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="md:size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
}

export default function Profile() {
    const router = useRouter();
    const username = router.query.username;
    const [feed, setFeed] = useState([{title: "Just finished listening to Madvillainy", body: "This was my 1000th listen!", id: 1, image: "https://upload.wikimedia.org/wikipedia/en/5/5e/Madvillainy_cover.png", isLoaded: true}]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const observer = useRef();
    const lastCardRef = useCallback((node) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                loadMoreItems();
            }
        });
        if (node) observer.current.observe(node);
        console.log(node);
    }, [loading, hasMore]);

    const loadMoreItems = () => {
        if (loading || !hasMore) return;

        setLoading(true);
        const newItems = Array.from({ length: 2 }, (_, i) => ({title: "Just finished listening to Madvillainy", body: "This was my 1000th listen!", id: i, image: "https://upload.wikimedia.org/wikipedia/en/5/5e/Madvillainy_cover.png", isLoaded: false}));
        const updatedFeed = [...feed, ...newItems];
        setFeed(updatedFeed);

        setTimeout(() => {
            setFeed(updatedFeed.map((post) => {
                return !post.isLoaded ? {...post, isLoaded: true} : post;
            }));

            if (page === 5) {
                setHasMore(false);
            }

            setPage(page + 1);
            setLoading(false);
        }, 1000);
    };

    useEffect(() => {
        const handleScroll = () => {
            if (
                window.innerHeight + window.scrollY >=
                document.body.offsetHeight
            ) {
                loadMoreItems();
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [loading, hasMore]);

    useEffect(() => {
        loadMoreItems();
    }, []);

    return <>
        <Navbar />

        <div className="flex justify-center items-center my-8 mx-4">

            <Avatar
            className="md:w-20 md:h-20 w-14 h-14 text-large mr-4"
            src="https://i.pravatar.cc/150?u=a04258114e29026708c"
            />
            <div>
                <p className="text-xl font-bold">{username}</p>
                <p>1000 albums listened</p>
            </div>

            <Button color="secondary" className="ml-16"><Add />Follow</Button>
        </div>

        <div className="flex flex-col items-center justify-center">
            <h2>About me</h2>
            <p className="mb-8">creator of musicnerds</p>
            <h2>Mount Rushmore</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-4 overflow-y-auto h-full mb-8">
                <div className="w-full">
                    <Image isZoomed 
                    src="https://upload.wikimedia.org/wikipedia/en/5/5e/Madvillainy_cover.png" 
                    width={150} 
                    height={150} 
                    className="w-full h-auto object-cover"
                    />
                </div>
                <div className="w-full">
                    <Image isZoomed 
                    src="https://upload.wikimedia.org/wikipedia/en/5/5e/Madvillainy_cover.png" 
                    width={150} 
                    height={150} 
                    className="w-full h-auto object-cover"
                    />
                </div>
                <div className="w-full">
                    <Image isZoomed 
                    src="https://upload.wikimedia.org/wikipedia/en/5/5e/Madvillainy_cover.png" 
                    width={150} 
                    height={150} 
                    className="w-full h-auto object-cover"
                    />
                </div>
                <div className="w-full">
                    <Image isZoomed 
                    src="https://upload.wikimedia.org/wikipedia/en/5/5e/Madvillainy_cover.png" 
                    width={150} 
                    height={150} 
                    className="w-full h-auto object-cover"
                    />
                </div>
            </div>

            <h2>Feed</h2>

            <div>
                
                {feed.map((post, index) => {
                    if (feed.length === index + 1) {
                        return (
                            <Card key={post.id} className="m-4">
                                <Skeleton isLoaded={post.isLoaded}>
                                    <div className="md:flex p-4">
                                        <Image src={post.image} width={150} height={150}></Image>
                                            <div className="ml-4">
                                                <CardHeader>
                                                    <h3 className="text-lg font-semibold">{post.title}</h3>
                                                </CardHeader>
                                                <CardBody>
                                                    {post.body}
                                                </CardBody>
                                            </div>
                                    </div>
                                </Skeleton>
                                <div ref={lastCardRef}></div>
                            </Card>
                        )
                    } else {
                        return (
                            <Card key={post.id} className="m-4">
                                <Skeleton isLoaded={post.isLoaded}>
                                    <div className="md:flex p-4">
                                        <Image src={post.image} width={150} height={150}></Image>
                                            <div className="ml-4">
                                                <CardHeader>
                                                    <h3 className="text-lg font-semibold">{post.title}</h3>
                                                </CardHeader>
                                                <CardBody>
                                                    {post.body}
                                                </CardBody>
                                            </div>
                                    </div>
                                </Skeleton>
                            </Card>
                        )
                    }
                })}
            </div>
        </div>
        <Footer />
  </>;
}