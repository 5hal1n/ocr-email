import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center py-32 px-16 bg-white dark:bg-black gap-12">
        <div className="flex flex-col items-center gap-6 text-center">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={100}
            height={20}
            priority
          />
          <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
            OCR to Supabase
          </h1>
          <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
            Upload a document to process it with Upstage OCR and save the
            results to your database.
          </p>
        </div>
      </main>
    </div>
  );
}
