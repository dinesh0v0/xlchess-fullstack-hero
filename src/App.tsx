import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar/NavBar';
import Home from './pages/Home';
import Puzzles from './pages/Puzzles';

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/puzzles" element={<Puzzles />} />
      </Routes>
    </Router>
  );
}

export default App;
