import Link from "next/link";

export default function TopBar() {
  return (
    <section className="p-2 bg-amber-400 justify-center items-center flex">
      <p className="text-center text-sm uppercase">
        digital delivery + free gifts —{" "}
        <Link
          href="/collections/valentines"
          className="font-bold after:content-['_→'] after:ml-2 underline hover:no-underline"
        >
          The Ultimate Valentine&apos;s Gift
        </Link>
      </p>
    </section>
  );
}
