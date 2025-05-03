import { useEffect, useState } from 'react';
import { DataService } from '../config/DataService';
import ENDPOINTS from '../config/endpoints';
import { Link } from 'react-router-dom';

function Oqituvchilar() {
  const [oqituvchilar, setOqituvchilar] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const oqituvchiRes = await DataService.get(ENDPOINTS.OQITUVCHILAR);
        const fanlar = await DataService.get(ENDPOINTS.FANLAR);

        setOqituvchilar(
          oqituvchiRes.map((i) => ({
            ...i,
            mutaxassislik: fanlar.find((u) => u.id === i.fanId)?.nomi || '',
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
      <section>
        <h2 className="text-xl font-semibold mb-2">O'qituvchilar</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {oqituvchilar.map((o) => (
            <div key={o.id} className="border rounded-xl p-4 shadow">
              <img
                src={`../../public/img${o.imageUrl}`}
                alt={o.fio}
                className="w-full h-72 object-cover rounded-md mb-2"
              />
              <h3 className="font-semibold text-lg">
                <Link
                  to={`/oqituvchilar/${o.id}`}
                  className="text-indigo-600 hover:text-indigo-800 hover:underline"
                >
                  {o.fio}
                </Link>
              </h3>
              <p>Mutaxassisligi: {o.mutaxassislik}</p>
              <p>Telefon: {o.telefon}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Oqituvchilar;
