import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Header from './layout/Header';
import Footer from './layout/Footer';
import Talabalar from './pages/Talabalar';
import Oqituvchilar from './pages/Oqituvchilar';
import DarsJadvali from './pages/DarsJadvali';
import AdminPanel from './pages/AdminPanel';
import OqituvchiDetails from './pages/OqituvchiDetails';
import TalabaDetails from './pages/TalabaDetails';
import Login from './pages/Login';
import ENDPOINTS from './config/endpoints';
import { DataService } from './config/DataService'; // Eslatma: DataService import qilingan bo‘lishi kerak

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/talabalar" element={<Talabalar />} />
            <Route path="/oqituvchilar" element={<Oqituvchilar />} />
            <Route path="/dars-jadvali" element={<DarsJadvali />} />
            <Route
              path="/admin-panel"
              element={
                <AuthRoute>
                  <AdminPanel />
                </AuthRoute>
              }
            />
            <Route path="/oqituvchilar/:id" element={<OqituvchiDetails />} />
            <Route path="/talabalar/:id" element={<TalabaDetails />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
function AuthRoute({ children }) {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const saved = localStorage.getItem('dekanat');
        if (!saved) {
          setIsAuthenticated(false);
          return;
        }

        const [userName, password] = JSON.parse(saved);
        const users = await DataService.get(ENDPOINTS.FOYDALANUVCHILAR);
        const user = users.find((item) => item.userName === userName);

        if (user && user.password === password && user.roll === 'admin') {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Authentication error:', err);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return null;
  }

  if (!isAuthenticated) {
    navigate('/', { replace: true });
    return null;
  }

  return children;
}
export default App;
