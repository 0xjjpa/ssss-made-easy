import { Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SplitPage from './pages/SplitPage';
import CombinePage from './pages/CombinePage';
import NavBar from './components/NavBar';
import Footer from './components/Footer';

function App() {
  return (
    <div className="relative min-h-screen mx-auto lg:max-w-4xl md:max-w-3xl sm:max-w-2xl lg:min-w-4xl md:min-w-3xl sm:min-w-2xl min-w-[400px] overflow-hidden bg-white dark:bg-black py-6 sm:py-12">
      <NavBar />
      <div className="rounded-3xl bg-[#092540] md:px-20 sm:px-10 px-5 py-10 text-center">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/split" element={<SplitPage />} />
          <Route path="/combine" element={<CombinePage />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;
