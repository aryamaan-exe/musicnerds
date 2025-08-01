import { HeartIcon } from "./icons";

export function Footer() {
    return <footer className="w-full flex items-center justify-center py-3">
                <p className="flex flex-row gap-1 m-4">
                    Made with <HeartIcon fillColor="red" className="p-1" /> by ari.
                    Copyright &copy; ari {new Date().getFullYear()}. All rights reserved. Some rights reversed. I hope you vote for my project!</p>
            </footer>;
}