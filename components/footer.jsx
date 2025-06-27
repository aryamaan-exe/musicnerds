import { HeartFilledIcon } from "./icons";

export function Footer() {
    return <footer className="w-full flex items-center justify-center py-3">
                <p className="lg:flex m-4">
                    Made with <HeartFilledIcon className="text-danger p-1" /> by ari. Social links in navbar.
                    Copyright &copy; ari {new Date().getFullYear()}. All rights reserved. Some rights reversed. I hope you vote for my project!</p>
            </footer>;
}