import { GameBoard } from './components/GameBoard';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-cyan-100 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600 mb-2">
            Cat Match
          </h1>
          <p className="text-xl text-gray-600">Drag to swap, match 3, and complete 50 stages!</p>
        </div>
        <GameBoard />
      </div>
    </div>
  );
}

export default App;
