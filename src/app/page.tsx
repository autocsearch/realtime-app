import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-100 to-white px-6">
      <div className="max-w-3xl text-center space-y-6">
        <div className="flex justify-center">
          <Image src="/Owl.svg" alt="NestChat Logo" width={64} height={64} />
        </div>
        <h1 className="text-4xl font-bold text-gray-800">NestChat</h1>
        <p className="text-lg text-gray-600">
          NestChat is a real-time messaging app designed with a focus on simplicity, speed, and secure connections. Built using <strong>Next.js</strong>, <strong>NextAuth</strong>, <strong>Redis</strong>, and <strong>Tailwind CSS</strong>.
        </p>

        <Link href="/login" className="inline-block px-6 py-3 bg-indigo-600 text-white font-semibold rounded-full shadow hover:bg-indigo-700 transition">
          Try it now
        </Link>
      </div>
    </main>
  );
}
