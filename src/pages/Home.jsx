import { useEffect, useState } from 'react';
import { DataService } from '../config/DataService';
import ENDPOINTS from '../config/endpoints';
import Slider from 'react-slick';
import { Link } from 'react-router-dom';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import '../App.css';

const HomePage = () => {
  const [talabalar, setTalabalar] = useState([]);
  const [oqituvchilar, setOqituvchilar] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const talabaRes = await DataService.get(ENDPOINTS.TALABALAR);
        const oqituvchiRes = await DataService.get(ENDPOINTS.OQITUVCHILAR);
        const guruhlarRes = await DataService.get(ENDPOINTS.GURUHLAR);
        const fanlar = await DataService.get(ENDPOINTS.FANLAR);
        setTalabalar(
          talabaRes.map((i) => ({
            ...i,
            guruhi: guruhlarRes.find((u) => u.id === i.guruhlarId)?.nomi || '',
          })),
        );
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
      <h1 className="text-2xl font-bold mb-4">Bosh Sahifa</h1>
      <section className="relative">
        <h2 className="text-xl font-semibold mb-2">Talabalar</h2>
        <Slider
          dots={true}
          infinite={true}
          speed={500}
          slidesToShow={3}
          slidesToScroll={1}
          arrows={true}
          nextArrow={<NextArrow />}
          prevArrow={<PrevArrow />}
          responsive={[
            {
              breakpoint: 1024,
              settings: { slidesToShow: 2 },
            },
            {
              breakpoint: 768,
              settings: { slidesToShow: 1 },
            },
          ]}
        >
          {talabalar.map((t) => (
            <div key={t.id} className="px-2">
              <div className="border rounded-xl p-4 shadow">
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
            </div>
          ))}
        </Slider>
      </section>

      <section className="relative">
        <h2 className="text-xl font-semibold mb-4">O'qituvchilar</h2>
        <Slider
          dots={true}
          infinite={true}
          speed={500}
          slidesToShow={3}
          slidesToScroll={1}
          arrows={true}
          nextArrow={<NextArrow />}
          prevArrow={<PrevArrow />}
          responsive={[
            {
              breakpoint: 1024,
              settings: { slidesToShow: 2 },
            },
            {
              breakpoint: 768,
              settings: { slidesToShow: 1 },
            },
          ]}
        >
          {oqituvchilar.map((o) => (
            <div key={o.id} className="px-2">
              <div className="border rounded-xl p-4 shadow">
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
            </div>
          ))}
        </Slider>
      </section>
    </div>
  );
};

const NextArrow = (props) => {
  const { onClick } = props;
  return (
    <div
      onClick={onClick}
      className="absolute right-2 top-1/2 transform -translate-y-1/2 z-20 bg-transparent text-black p-2 rounded-full cursor-pointer text-xl border"
    >
      ▶
    </div>
  );
};

const PrevArrow = (props) => {
  const { onClick } = props;
  return (
    <div
      onClick={onClick}
      className="absolute left-2 top-1/2 transform -translate-y-1/2 z-20 bg-transparent text-black p-2 rounded-full cursor-pointer text-xl border"
    >
      ◀
    </div>
  );
};

export default HomePage;
