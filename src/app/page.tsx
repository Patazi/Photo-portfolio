import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Image
        src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
        alt="Main showcase"
        width={1200}
        height={800}
        className="rounded-lg shadow-lg object-cover w-full max-w-4xl h-[60vh]"
        priority
      />
      <h1 className="mt-8 text-3xl md:text-5xl font-bold text-center text-gray-900 drop-shadow-lg">
        Welcome to Tzehow Lee Photography
      </h1>
    </div>
  );
}
