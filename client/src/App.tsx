import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Root from './pages/RootPage';
import CleaningPage from './pages/CleaningPage';
import TaxPage from './pages/TaxPage';
import TrainingPage from './pages/TrainingPage';
import CateringPage from './pages/CateringPage';
import GaragePage from './pages/GaragePage';
import TutoringPage from './pages/TutoringPage';
import DesignPage from './pages/DesignPage';
import LoyaltyCardPage from './pages/LoyaltyCardPage';
import AccountPage from './pages/AccountPage';
import { ZipCodeProvider } from './context/ZipCodeContext';
import { SearchProvider } from './context/SearchContext';
import SideNav from './components/SideNav';

const App: React.FC = () => {
  return (
    <ZipCodeProvider>
      <SearchProvider>
        <div className='page-container'>
          <SideNav />
          <div className='content' style={{display: 'flex'}}>
            <Router>
              <Routes>
                <Route path="/" element={<Root />} />
                <Route path="/dhc" element={<CleaningPage />} />
                <Route path="/rts" element={<TaxPage />} />
                <Route path="/dat" element={<TrainingPage />} />
                <Route path="/dc" element={<CateringPage />} />
                <Route path="/mmg" element={<GaragePage />} />
                <Route path="/abct" element={<TutoringPage />} />
                <Route path="/ccds" element={<DesignPage />} />
                <Route path="/loyalty-card" element={<LoyaltyCardPage />} />
                <Route path="/account" element={<AccountPage />} />
              </Routes>
            </Router>
          </div>
        </div>
      </SearchProvider>
    </ZipCodeProvider>
  );
};

export default App;