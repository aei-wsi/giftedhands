import Link from "next/link";
import CharterBuilder from "@/components/board/CharterBuilder";

export default function CreateBoardPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <Link href="/" className="text-sm text-ink-secondary hover:text-gold">
        ← The Boardroom
      </Link>
      <h1 className="mb-8 mt-4 text-center font-display text-3xl gold-text">
        Build your board
      </h1>
      <CharterBuilder />
    </main>
  );
}
