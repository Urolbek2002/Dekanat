import { useState, useEffect } from 'react';
import { DataService } from '../config/DataService';
import ENDPOINTS from '../config/endpoints';
//.put
const AdminPanel = () => {
  const [formData, setFormData] = useState({
    talaba: {
      fio: '',
      tYili: '',
      jinsi: '',
      imageUrl: '',
      telefon: '',
      izoh: '',
      guruhlarId: '',
    },
    guruh: { nomi: '' },
    fan: { nomi: '' },
    oqituvchi: {
      fio: '',
      tYili: '',
      jinsi: '',
      imageUrl: '',
      telefon: '',
      izoh: '',
      fanId: '',
    },
    darsxona: { nomi: '' },
    foydalanuvchilar: {
      fio: '',
      userName: '',
      password: '',
      imageUrl: '',
      roll: '',
      adminQoshish: false,
    },
  });

  const [guruhlar, setGuruhlar] = useState([]);
  const [oqituvchilar, setOqituvchilar] = useState([]);
  const [fanlar, setFanlar] = useState([]);
  const [darsxonalar, setDarsxonalar] = useState([]);
  const [talabalar, setTalabalar] = useState([]);
  const [foydalanuvchilar, setFoydalanuvchilar] = useState([]);
  const [adminQoshish, setAdminQoshish] = useState(false);
  const [error, setError] = useState(true);
  const jins = [{ key: 'Erkak' }, { key: 'Ayol' }];
  const roll = [{ key: 'admin' }, { key: 'user' }];
  const xuquq = [
    { key: "Admin qo'sha olmaslik", value: false },
    { key: "Admin qo'sha olish" },
  ];

  const fetchData = async () => {
    const [gr, oq, fa, dx, ta, fo] = await Promise.all([
      DataService.get(ENDPOINTS.GURUHLAR),
      DataService.get(ENDPOINTS.OQITUVCHILAR),
      DataService.get(ENDPOINTS.FANLAR),
      DataService.get(ENDPOINTS.DARS_XONALARI),
      DataService.get(ENDPOINTS.TALABALAR),
      DataService.get(ENDPOINTS.FOYDALANUVCHILAR),
    ]);
    setGuruhlar(gr);
    setOqituvchilar(oq);
    setFanlar(fa);
    setDarsxonalar(dx);
    setTalabalar(ta);
    setFoydalanuvchilar(fo);
  };

  useEffect(() => {
    const init = async () => {
      await fetchData();

      const saved = localStorage.getItem('dekanat');
      if (!saved) return;

      let userName, password;
      try {
        [userName, password] = JSON.parse(saved);
      } catch {
        return;
      }

      setFoydalanuvchilar((prev) => {
        const user = prev.find((item) => item.userName === userName);
        if (
          user?.password === password &&
          user.roll === 'admin' &&
          user.adminQoshish
        ) {
          setAdminQoshish(true);
        }
        return prev;
      });
    };

    init();
  }, []); // foydalanuvchilar dependencydan olib tashlandi

  const handleChange = (e, section) => {
    setFormData({
      ...formData,
      [section]: { ...formData[section], [e.target.name]: e.target.value },
    });
  };

  const userNameChange = (e, section) => {
    setFormData({
      ...formData,
      [section]: { ...formData[section], [e.target.name]: e.target.value },
    });
    if (e.target.value.length > 4) {
      const user = foydalanuvchilar.find((i) => i.userName === e.target.value);
      if (!user) {
        setError(false);
      } else {
        setError(true);
      }
    } else {
      setError(true);
    }
  };

  const handleSubmit = async (section, endpoint) => {
    try {
      const item = formData[section];
      if (item.id) {
        await DataService.xput(`${endpoint}/${item.id}`, item);
        alert('Muvaffaqiyatli yangilandi!');
      } else {
        await DataService.post(endpoint, item);
        alert('Muvaffaqiyatli qo‘shildi!');
      }
      // Tahrirlangan qism - asl strukturasini saqlab qolish
      setFormData((prev) => ({
        ...prev,
        [section]: Array.isArray(prev[section])
          ? []
          : typeof prev[section] === 'object'
          ? { ...initialFormData[section] }
          : '',
      }));
      fetchData();
    } catch (err) {
      alert(
        `Xatolik: ${
          err.response?.data?.message || err.message || 'Nomaʼlum xatolik'
        }`,
      );
    }
  };

  const handleDelete = async (section, endpoint, id) => {
    if (!window.confirm('Rostdan ham o‘chirmoqchimisiz?')) return;
    try {
      await DataService.delete(`${endpoint}/${id}`);
      alert('Muvaffaqiyatli o‘chirildi!');
      fetchData();
    } catch (err) {
      alert('Xatolik: ' + (err?.message || 'Nomaʼlum'));
    }
  };

  const handleEdit = (section, item) => {
    setFormData((prev) => ({ ...prev, [section]: { ...item } }));
  };

  const renderList = (items, section, endpoint, displayField = 'nomi') => (
    <ul className="mt-4 space-y-2">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex justify-between items-center border p-2 rounded"
        >
          <span>{item[displayField]}</span>
          <div className="space-x-2">
            <button
              onClick={() => handleEdit(section, item)}
              className="text-blue-600 hover:underline"
            >
              Tahrirlash
            </button>
            <button
              onClick={() => handleDelete(section, endpoint, item.id)}
              className="text-red-600 hover:underline"
            >
              O‘chirish
            </button>
          </div>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Admin Panel</h1>

      {/* Guruh Qo‘shish */}
      <div className="border p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">Guruh Qo‘shish</h2>
        <input
          className="input"
          name="nomi"
          value={formData.guruh.nomi || ''}
          placeholder="Guruh nomi"
          onChange={(e) => handleChange(e, 'guruh')}
        />
        <button
          className="btn"
          onClick={() => handleSubmit('guruh', ENDPOINTS.GURUHLAR)}
        >
          Qo‘shish / Yangilash
        </button>
        {renderList(guruhlar, 'guruh', ENDPOINTS.GURUHLAR)}
      </div>

      {/* Fan Qo‘shish */}
      <div className="border p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">Fan Qo‘shish</h2>
        <input
          className="input"
          name="nomi"
          value={formData.fan.nomi || ''}
          placeholder="Fan nomi"
          onChange={(e) => handleChange(e, 'fan')}
        />
        <button
          className="btn"
          onClick={() => handleSubmit('fan', ENDPOINTS.FANLAR)}
        >
          Qo‘shish / Yangilash
        </button>
        {renderList(fanlar, 'fan', ENDPOINTS.FANLAR)}
      </div>

      {/* Darsxona Qo‘shish */}
      <div className="border p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">Darsxona Qo‘shish</h2>
        <input
          className="input"
          name="nomi"
          value={formData.darsxona.nomi || ''}
          placeholder="Darsxona nomi"
          onChange={(e) => handleChange(e, 'darsxona')}
        />
        <button
          className="btn"
          onClick={() => handleSubmit('darsxona', ENDPOINTS.DARS_XONALARI)}
        >
          Qo‘shish / Yangilash
        </button>
        {renderList(darsxonalar, 'darsxona', ENDPOINTS.DARS_XONALARI)}
      </div>

      {/* O‘qituvchi Qo‘shish */}
      <div className="border p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">O‘qituvchi Qo‘shish</h2>
        <div className="grid grid-cols-2 gap-4">
          <input
            className="input"
            name="fio"
            placeholder="FIO"
            value={formData.oqituvchi.fio || ''}
            onChange={(e) => handleChange(e, 'oqituvchi')}
          />
          <div className="relative">
            <input
              className="block w-full px-3 py-2 border border-black rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 peer"
              name="tYili"
              type="date"
              value={formData.oqituvchi.tYili || ''}
              onChange={(e) => handleChange(e, 'oqituvchi')}
              placeholder=" "
            />
            <label className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-indigo-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1">
              To'g'ilgan yili
            </label>
          </div>
          <input
            className="input"
            name="imageUrl"
            placeholder="Rasm URL"
            value={formData.oqituvchi.imageUrl || ''}
            onChange={(e) => handleChange(e, 'oqituvchi')}
          />
          <input
            className="input"
            name="telefon"
            placeholder="Tel."
            value={formData.oqituvchi.telefon || ''}
            onChange={(e) => handleChange(e, 'oqituvchi')}
          />
          <select
            className="input"
            name="jinsi"
            value={formData.oqituvchi.jinsi || ''}
            onChange={(e) => handleChange(e, 'oqituvchi')}
          >
            <option value="">Jinsni tanlang</option>
            {jins.map((g) => (
              <option key={g.key} value={g.key}>
                {g.key}
              </option>
            ))}
          </select>
          <select
            className="input"
            name="fanId"
            value={formData.oqituvchi.fanId || ''}
            onChange={(e) => handleChange(e, 'oqituvchi')}
          >
            <option value="">Fan tanlang</option>
            {fanlar.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nomi}
              </option>
            ))}
          </select>

          <div className="col-span-2">
            <textarea
              className="block w-full px-3 py-2 border border-black rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              name="izoh"
              rows="4"
              placeholder="Izoh qoldirish"
              value={formData.oqituvchi.izoh || ''}
              onChange={(e) => handleChange(e, 'oqituvchi')}
            />
          </div>
        </div>
        <button
          className="btn mt-4"
          onClick={() => handleSubmit('oqituvchi', ENDPOINTS.OQITUVCHILAR)}
        >
          Qo‘shish / Yangilash
        </button>
        {renderList(oqituvchilar, 'oqituvchi', ENDPOINTS.OQITUVCHILAR, 'fio')}
      </div>

      {/* Talaba Qo‘shish */}
      <div className="border p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">Yangi Talaba Qo‘shish</h2>
        <div className="grid grid-cols-2 gap-4">
          <input
            className="input"
            name="fio"
            placeholder="FIO"
            value={formData.talaba.fio || ''}
            onChange={(e) => handleChange(e, 'talaba')}
          />
          <div className="relative">
            <input
              className="block w-full px-3 py-2 border border-black rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 peer"
              name="tYili"
              type="date"
              value={formData.talaba.tYili || ''}
              onChange={(e) => handleChange(e, 'talaba')}
              placeholder=" "
            />
            <label className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-indigo-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1">
              To'g'ilgan yili
            </label>
          </div>
          <input
            className="input"
            name="telefon"
            placeholder="Tel."
            value={formData.talaba.telefon || ''}
            onChange={(e) => handleChange(e, 'talaba')}
          />
          <select
            className="input"
            name="jinsi"
            value={formData.talaba.jinsi || ''}
            onChange={(e) => handleChange(e, 'talaba')}
          >
            <option value="">Jinsni tanlang</option>
            {jins.map((g) => (
              <option key={g.key} value={g.key}>
                {g.key}
              </option>
            ))}
          </select>
          <input
            className="input"
            name="imageUrl"
            placeholder="Rasm URL"
            value={formData.talaba.imageUrl || ''}
            onChange={(e) => handleChange(e, 'talaba')}
          />
          <select
            className="input"
            name="guruhlarId"
            value={formData.talaba.guruhlarId || ''}
            onChange={(e) => handleChange(e, 'talaba')}
          >
            <option value="">Guruh tanlang</option>
            {guruhlar.map((g) => (
              <option key={g.id} value={g.id}>
                {g.nomi}
              </option>
            ))}
          </select>
          <div className="col-span-2">
            <textarea
              className="block w-full px-3 py-2 border border-black rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              name="izoh"
              rows="4"
              placeholder="Izoh qoldirish"
              value={formData.talaba.izoh || ''}
              onChange={(e) => handleChange(e, 'talaba')}
            />
          </div>
        </div>
        <button
          className="btn mt-4"
          onClick={() => handleSubmit('talaba', ENDPOINTS.TALABALAR)}
        >
          Qo‘shish / Yangilash
        </button>
        {renderList(talabalar, 'talaba', ENDPOINTS.TALABALAR, 'fio')}
      </div>

      {adminQoshish && (
        <div className="border p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">
            Yangi Foydalanuvchi Qo‘shish
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <input
              className="input"
              name="fio"
              placeholder="FIO"
              value={formData.foydalanuvchilar.fio || ''}
              onChange={(e) => handleChange(e, 'foydalanuvchilar')}
            />
            <input
              className="input"
              name="userName"
              placeholder="Foydalanuvchi nomi"
              value={formData.foydalanuvchilar.userName || ''}
              onChange={(e) => userNameChange(e, 'foydalanuvchilar')}
            />

            <input
              className="input"
              name="password"
              placeholder="Parol"
              value={formData.foydalanuvchilar.password || ''}
              onChange={(e) => handleChange(e, 'foydalanuvchilar')}
            />
            <select
              className="input"
              name="roll"
              value={formData.foydalanuvchilar.roll || ''}
              onChange={(e) => handleChange(e, 'foydalanuvchilar')}
            >
              <option value="">Lavozimni tanlang</option>
              {roll.map((g) => (
                <option key={g.key} value={g.key}>
                  {g.key}
                </option>
              ))}
            </select>
            <input
              className="input"
              name="imageUrl"
              placeholder="Rasm URL"
              value={formData.foydalanuvchilar.imageUrl || ''}
              onChange={(e) => handleChange(e, 'foydalanuvchilar')}
            />
            <select
              className="input"
              name="adminQoshish"
              value={formData.foydalanuvchilar.adminQoshish || false}
              onChange={(e) => handleChange(e, 'foydalanuvchilar')}
            >
              <option value={false}>Xuquqni tanlang</option>
              {xuquq.map((g) => (
                <option key={g.key} value={g.value}>
                  {g.key}
                </option>
              ))}
            </select>
          </div>
          {error && (
            <h3 className="text-red-500">
              Foydalanuvchi nomi kiritilmagan yoki xato kiritilgan!
            </h3>
          )}
          {!error && (
            <button
              className="btn mt-4"
              onClick={() =>
                handleSubmit('foydalanuvchilar', ENDPOINTS.FOYDALANUVCHILAR)
              }
            >
              Qo‘shish / Yangilash
            </button>
          )}
          {renderList(
            foydalanuvchilar,
            'foydalanuvchilar',
            ENDPOINTS.FOYDALANUVCHILAR,
            'fio',
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
