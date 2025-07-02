import { Input, Button } from "@heroui/react";
import { useState } from "react";

export function SearchIcon() {
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
}

export function SearchBar({ onSearch, loading }) {
  const [value, setValue] = useState("");

  return (
    <div className="flex gap-2">
      <Input
        startContent={<SearchIcon />}
        value={value}
        onChange={e => setValue(e.target.value)}
      />
      <Button
        color="secondary"
        onPress={() => onSearch(value)}
        isLoading={loading}
      >
        {loading ? "Searching..." : "Search"}
      </Button>
    </div>
  );
}