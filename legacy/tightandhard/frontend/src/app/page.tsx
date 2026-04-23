export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center text-white">
          <h1 className="text-6xl font-bold mb-6">
            Welcome to TightandHard
          </h1>
          <p className="text-2xl mb-8 text-blue-100">
            AI Companions with True Memory
          </p>
          <div className="flex justify-center space-x-4">
            <a
              href="/legal"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
            >
              View Legal Pages
            </a>
            <a
              href="/pitch-deck"
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              View Pitch Deck
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}