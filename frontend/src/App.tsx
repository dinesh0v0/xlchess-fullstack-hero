/**
 * Root application component for XLChess.
 *
 * Renders the hero section within semantic HTML structure.
 * Designed for future expansion with routing (React Router)
 * and additional page sections.
 */

import { HeroContainer } from './components/HeroSection';

function App() {
  return (
    <div className="min-h-screen bg-brand-navy">
      <header className="sr-only">
        <h1>XLChess — Excel at Chess</h1>
      </header>

      <main>
        <HeroContainer />
      </main>

      <footer className="sr-only">
        <p>&copy; 2024 XLChess. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
