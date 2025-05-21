import PhotoGallery from '../components/PhotoGallery';

export default function Portfolio() {
  return (
    <main className="min-h-screen w-full overflow-x-hidden scrollable">
      <div className="max-w-8xl mx-auto px-2 sm:px-4 py-4 mt-2">
        <h2 className="text-3xl font-bold mb-4 text-center text-gray-900">Portfolio</h2>
        <PhotoGallery />
      </div>
    </main>
  );
} 