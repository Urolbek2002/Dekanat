import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DataService } from '../config/DataService';
import ENDPOINTS from '../config/endpoints';

function Talabalar() {
  const [talabalar, setTalabalar] = useState([]);
  const [search, setSearch] = useState('');

  const filteredTalabalar = talabalar.filter((t) =>
    t.fio.toLowerCase().includes(search.toLowerCase()),
  );
  useEffect(() => {
    const fetchData = async () => {
      try {
        const talabaRes = await DataService.get(ENDPOINTS.TALABALAR);
        const guruhlarRes = await DataService.get(ENDPOINTS.GURUHLAR);
        setTalabalar(
          talabaRes.map((i) => ({
            ...i,
            guruhi: guruhlarRes.find((u) => u.id === i.guruhlarId).nomi,
          })),
        );
      } catch (err) {
        console.error('Maʼlumotlarni olishda xatolik:', err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Bosh Sahifa</h1>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Talabalar</h2>
        <input
          type="text"
          placeholder="Talaba ismi bo‘yicha qidiring..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4 px-4 py-2 border rounded-md w-full md:w-1/2"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTalabalar.map((t) => (
            <div key={t.id} className="border rounded-xl p-4 shadow">
              <img
                src={`../../public/img${t.imageUrl}`}
                alt={t.fio}
                className="w-full h-72 object-cover rounded-md mb-2"
              />
              <h3 className="font-semibold">
                <Link
                  to={`/talabalar/${t.id}`}
                  className="text-indigo-600 hover:text-indigo-800 hover:underline"
                >
                  {t.fio}
                </Link>
              </h3>
              <p>Yoshi: {t.yoshi}</p>
              <p>Jinsi: {t.jinsi}</p>
              <p>Guruhi: {t.guruhi}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Talabalar;
