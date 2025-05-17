export default function Contact() {
  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold mb-8 text-center">Contact</h2>
      <form className="flex flex-col gap-6 bg-white p-8 rounded-lg shadow-md">
        <label className="flex flex-col gap-2">
          <span className="font-semibold">Name</span>
          <input type="text" className="border rounded px-3 py-2" placeholder="Your name" required />
        </label>
        <label className="flex flex-col gap-2">
          <span className="font-semibold">Email</span>
          <input type="email" className="border rounded px-3 py-2" placeholder="you@email.com" required />
        </label>
        <label className="flex flex-col gap-2">
          <span className="font-semibold">Message</span>
          <textarea className="border rounded px-3 py-2" rows={5} placeholder="Your message" required />
        </label>
        <button type="submit" className="bg-black text-white py-2 rounded hover:bg-gray-800 transition-colors font-semibold">Send</button>
      </form>
    </div>
  );
} 