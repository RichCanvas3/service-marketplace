import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PageContent from './components/PageContent';
import SideNav from './components/SideNav';
import Root from './pages/RootPage';
import Example from './pages/ExamplePage';
import CleaningPage from './pages/CleaningPage';
import { ZipCodeProvider } from './context/ZipCodeContext';
import { SearchProvider } from './context/SearchContext';

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
                <Route path="/example" element={<Example />} />
                <Route path="/dhc" element={<CleaningPage />} />
              </Routes>
            </Router>
          </div>
        </div>
      </SearchProvider>
    </ZipCodeProvider>
  );
};

export default App;