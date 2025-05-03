import { Link, useNavigate } from 'react-router-dom';
import { DataService } from '../config/DataService';
import endpoints from '../config/endpoints';
import { useState } from 'react';

function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    userName: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const data = await DataService.get(endpoints.FOYDALANUVCHILAR);
      const user = data.find((obj) => obj.userName === formData.userName);

      if (user && formData.password === user.password) {
        localStorage.setItem(
          'dekanat',
          JSON.stringify([user.userName, user.password]),
        );
        navigate('/');
        window.location.reload();
      } else {
        setError('Foydalanuvchi nomi yoki parol noto‘g‘ri!');
      }
    } catch (err) {
      setError('Server bilan bog‘lanishda xatolik yuz berdi!');
    }
  };

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-gray-900">
          Hisobga kirish
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="userName"
              className="block text-sm font-medium text-gray-900"
            >
              Username
            </label>
            <div className="mt-2">
              <input
                type="text"
                name="userName"
                id="userName"
                required
                value={formData.userName}
                onChange={handleChange}
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-center">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-900"
              >
                Parol
              </label>
            </div>
            <div className="mt-2">
              <input
                type="password"
                name="password"
                id="password"
                required
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600 sm:text-sm"
              />
            </div>
            {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
          </div>

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500 focus:outline-indigo-600"
            >
              Kirish
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
