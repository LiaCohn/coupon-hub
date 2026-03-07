import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AdminPage from './pages/AdminPage';
import CustomerPage from './pages/CustomerPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-container">
            <h1 className="logo">🎟️ Coupon Hub</h1>
            <div className="nav-links">
              <Link to="/" className="nav-link">Customer</Link>
              <Link to="/admin" className="nav-link">Admin</Link>
            </div>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<CustomerPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </main>

        <footer className="footer">
          <p>© 2026 Coupon Hub - Digital Marketplace</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
