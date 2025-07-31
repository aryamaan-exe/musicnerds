import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

export default function Featured() {
    return (
    <>
        <Navbar />
        
        <main className="h-[85vh] flex items-center lg:ml-64 ml-8">
            <div>
                <h1>Coming soon</h1>
            </div>
        </main>

        <Footer />
    </>);
}