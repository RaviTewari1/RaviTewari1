import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import CacheableComponent from './CacheableComponent';
import OnlineComponent from './OnlineComponent';

const Navigation = () => {
  const location = useLocation();
  
  return (
    <div>
      <nav>
        <Link to="/" style={{ margin: '0 10px' }}>Cacheable Route</Link>
        <Link to="/online" style={{ margin: '0 10px' }}>Online Only</Link>
      </nav>

      <Routes location={location}>
        <Route path="/" element={<CacheableComponent />} />
        <Route
          path="/online"
          element={
            navigator.onLine ? (
              <OnlineComponent />
            ) : (
              <Navigate to="/" state={{ from: location }} replace />
            )
          }
        />
      </Routes>
    </div>
  );
};

const App = () => (
  <Router>
    <Navigation />
  </Router>
);

export default App;
