import { Button } from "@heroui/react";
import { useRouter } from "next/router";
import { title, subtitle } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";

export default function IndexPage() {
  const router = useRouter();

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-xl text-center justify-center">
          <h1 className={title()}>For music nerds, by music nerds.</h1>
          <p className="mb-16"></p>
          <p className={subtitle()}>Musicnerds lets you catalog your albums, showcase your taste and curate music for others.</p>
          <Button color="secondary" className="mt-16 font-semibold" onPress={() => {router.push("/auth")}}>Create an account</Button>
        </div>
      </section>
    </DefaultLayout>
  );
}
