import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DataService } from '../config/DataService';
import endpoints from '../config/endpoints';

const OqituvchiDetails = () => {
  const { id } = useParams(); // URL dan id ni olish
  const navigate = useNavigate();
  const [oqituvchi, setOqituvchi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOqituvchi = async () => {
      try {
        const response = await DataService.get(
          endpoints.OQITUVCHILARDETAILS(id),
        );
        const fanlar = await DataService.get(endpoints.FANLAR);
        response.fan = fanlar.find((i) => i.id === response.fanId).nomi;
        setOqituvchi(response);
        setError(null);
      } catch (err) {
        console.error('Xatolik yuz berdi:', err);
        setError(err.message || "Ma'lumotlarni yuklab bo'lmadi");
      } finally {
        setLoading(false);
      }
    };

    fetchOqituvchi();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Xatolik yuz berdi
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
          >
            Orqaga qaytish
          </button>
        </div>
      </div>
    );
  }

  if (!oqituvchi) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-gray-500 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            O'qituvchi topilmadi
          </h2>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
          >
            Orqaga qaytish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden flex justify-center">
        <div className="md:flex">
          <div className="md:flex-shrink-0">
            <img
              className="h-48 w-full object-cover md:w-48 md:h-full"
              src={`../../public/img${oqituvchi.imageUrl}`}
              alt={oqituvchi.fio}
            />
          </div>
          <div className="p-8">
            <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
              O'qituvchi ma'lumotlari
            </div>
            <h1 className="block mt-2 text-2xl font-bold text-gray-800">
              {oqituvchi.fio}
            </h1>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Yoshi:</p>
                <p className="font-medium">{oqituvchi.yoshi}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Jinsi:</p>
                <p className="font-medium">{oqituvchi.jinsi}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Telefon:</p>
                <p className="font-medium">
                  <a
                    href={`tel:${oqituvchi.telefon}`}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    {oqituvchi.telefon}
                  </a>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Mutahasisligi:</p>
                <p className="font-medium">{oqituvchi.fan}</p>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm text-gray-500">Qo'shimcha ma'lumot:</p>
              <p className="mt-1 text-gray-600">{oqituvchi.izoh}</p>
            </div>

            <div className="mt-8">
              <button
                onClick={() => navigate(-1)}
                className="ml-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
              >
                Orqaga
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OqituvchiDetails;
