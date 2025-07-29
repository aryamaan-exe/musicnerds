import { Card, CardBody, Image, Button, Spinner } from "@heroui/react";
import { useRef, useCallback } from "react";
import { Add } from "./icons";

export function AlbumResults({ results, loading, hasMore, onAdd, onLoadMore }) {
  const observer = useRef();

  const lastRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        onLoadMore();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  return (
    <div className="flex flex-col min-h-screen m-4 justify-center items-center *:w-[75%]">
      {results.map((album, i) => (
        <Card key={i} ref={i === results.length - 1 ? lastRef : null} className="m-1">
          <CardBody className="flex flex-row gap-8">
            <Image src={album.url} width={150} height={150} />
            <div>
              <h3 className="text-xl font-bold mb-4">{album.name}</h3>
              <p className="text-lg mb-4">{album.artist}</p>
              <Button
                color="secondary"
                onPress={() => onAdd(album)}
              >
                <Add /> Add
              </Button>
            </div>
          </CardBody>
        </Card>
      ))}
      {loading && <Spinner size="lg" color="secondary" className="mt-4" />}
    </div>
  );
}