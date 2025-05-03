import { useState, useEffect } from 'react';
import ENDPOINTS from '../config/endpoints';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { DataService } from '../config/DataService'; // Eslatma: DataService import qilingan bo‘lishi kerak

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [navItems, setNavItems] = useState([
    { name: 'Bosh sahifa', path: '/' },
    { name: 'Talabalar', path: '/talabalar' },
    { name: 'O‘qituvchilar', path: '/oqituvchilar' },
    { name: 'Dars jadvali', path: '/dars-jadvali' },
  ]);
  const [profileOpen, setProfileOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const users = await DataService.get(ENDPOINTS.FOYDALANUVCHILAR);
        const saved = localStorage.getItem('dekanat');
        if (!saved) return;

        const [userName, password] = JSON.parse(saved);
        const user = users.find((item) => item.userName === userName);
        if (user && user.password === password) {
          if (user.roll === 'admin') {
            setNavItems([
              { name: 'Bosh sahifa', path: '/' },
              { name: 'Talabalar', path: '/talabalar' },
              { name: 'O‘qituvchilar', path: '/oqituvchilar' },
              { name: 'Dars jadvali', path: '/dars-jadvali' },
              { name: 'Admin panel', path: '/admin-panel' },
            ]);
            setUserInfo(user);
          } else {
            setUserInfo(user);
          }
        }
      } catch (err) {
        console.error('Maʼlumotlarni olishda xatolik:', err);
      }
    };
    fetchData();
  }, []);

  const logout = () => {
    localStorage.removeItem('dekanat');
    setUserInfo(null);
    window.location.reload();
  };

  return (
    <header className="bg-cyan-100 shadow sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">
          Dekanat Platformasi
        </h1>

        {/* Desktop menu */}
        <nav className="hidden md:flex gap-6 items-center">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive
                  ? 'text-blue-600 font-semibold border-b-2 border-blue-600 pb-1'
                  : 'text-gray-700 hover:text-blue-600 transition'
              }
            >
              {item.name}
            </NavLink>
          ))}

          {/* Foydalanuvchi bo‘lsa: */}
          {userInfo ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="text-blue-700 font-medium"
              >
                {userInfo.userName}
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border shadow-lg rounded p-4 z-50">
                  <img
                    src={`../../public/img${userInfo.imageUrl}`}
                    alt="User"
                    className="w-16 h-16 rounded-full mx-auto"
                  />
                  <h3 className="text-center mt-2 font-semibold">
                    {userInfo.fio}
                  </h3>
                  <p className="text-center text-sm text-gray-600">
                    {userInfo.role}
                  </p>
                  <button
                    onClick={logout}
                    className="mt-4 w-full bg-red-500 text-white py-1 rounded hover:bg-red-600 transition"
                  >
                    Chiqish
                  </button>
                </div>
              )}
            </div>
          ) : (
            <NavLink
              to="/login"
              className="text-blue-600 border px-3 py-1 rounded hover:bg-blue-100 transition"
            >
              Kirish
            </NavLink>
          )}
        </nav>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden text-blue-600"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden bg-white shadow px-4 pb-4">
          <nav className="flex flex-col gap-3">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  isActive
                    ? 'text-blue-600 font-semibold border-b border-blue-600 pb-1'
                    : 'text-gray-700 hover:text-blue-600 transition'
                }
              >
                {item.name}
              </NavLink>
            ))}
            {userInfo ? (
              <button onClick={logout} className="text-left text-red-600 mt-2">
                Chiqish
              </button>
            ) : (
              <NavLink
                to="/login"
                className="text-blue-600 border px-3 py-1 rounded w-max"
              >
                Kirish
              </NavLink>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
