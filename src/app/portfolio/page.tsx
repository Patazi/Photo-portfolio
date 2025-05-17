import PhotoGallery from '../components/PhotoGallery';

export default function Portfolio() {
  return (
    <main className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-4 mt-0">
        <h2 className="text-3xl font-bold mb-4 text-center text-gray-900">Portfolio</h2>
        <PhotoGallery />
      </div>
    </main>
  );
} 