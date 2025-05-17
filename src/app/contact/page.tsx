export default function Contact() {
  return (
    <div className="fixed inset-0 bg-[#fafafa]">
      <div className="max-w-xl mx-auto px-4 py-12 mt-24">
        <h2 className="text-3xl font-bold mb-12 text-center text-gray-900">Contact</h2>
        <form className="flex flex-col gap-6 bg-white p-8 rounded-lg shadow-lg">
          <label className="flex flex-col gap-2">
            <span className="font-semibold text-gray-900">Name</span>
            <input 
              type="text" 
              className="border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-transparent transition-all placeholder:text-gray-900 text-gray-900" 
              placeholder="Your name" 
              required 
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="font-semibold text-gray-900">Email</span>
            <input 
              type="email" 
              className="border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-transparent transition-all placeholder:text-gray-900 text-gray-900" 
              placeholder="you@email.com" 
              required 
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="font-semibold text-gray-900">Message</span>
            <textarea 
              className="border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-transparent transition-all placeholder:text-gray-900 text-gray-900" 
              rows={5} 
              placeholder="Your message" 
              required 
            />
          </label>
          <button 
            type="submit" 
            className="bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition-colors font-semibold shadow-md hover:shadow-lg"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
} 