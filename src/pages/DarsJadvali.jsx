import { useEffect, useState } from 'react';
import { DataService } from '../config/DataService';
import ENDPOINTS from '../config/endpoints';
import DarsQoshish from '../components/DarsQoshish';

function DarsJadvali() {
  const [darsJadvali, setDarsJadvali] = useState([]);
  const [guruhlar, setGuruhlar] = useState([]);
  const [darsXonalari, setDarsXonalari] = useState([]);
  const [fanlar, setFanlar] = useState([]);
  const [oqituvchilar, setOqituvchilar] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [editMode, setEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [login, setLogin] = useState(false);
  // jadval handleAddRow

  const haftaKunlari = {
    1: 'Dushanba',
    2: 'Seshanba',
    3: 'Chorshanba',
    4: 'Payshanba',
    5: 'Juma',
    6: 'Shanba',
    7: 'Yakshanba',
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const users = await DataService.get(ENDPOINTS.FOYDALANUVCHILAR);
        const saved = localStorage.getItem('dekanat');
        if (!saved) return;

        const [userName, password] = JSON.parse(saved);
        const user = users.find((item) => item.userName === userName);
        if (user && user.password === password) {
          setLogin(true);
        }
      } catch (err) {
        console.error('Maʼlumotlarni olishda xatolik: ', err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          darsJadvallariRes,
          darsXonasiRes,
          guruhlarRes,
          fanlarRes,
          oqituvchilarRes,
        ] = await Promise.all([
          DataService.get(ENDPOINTS.DARS_JADVALLARI),
          DataService.get(ENDPOINTS.DARS_XONALARI),
          DataService.get(ENDPOINTS.GURUHLAR),
          DataService.get(ENDPOINTS.FANLAR),
          DataService.get(ENDPOINTS.OQITUVCHILAR),
        ]);

        // Avval holatlar yangilansin
        setGuruhlar(guruhlarRes);
        setDarsXonalari(darsXonasiRes);
        setFanlar(fanlarRes);
        setOqituvchilar(oqituvchilarRes);

        // Keyin jadvalni tuzamiz
        const jadval = darsJadvallariRes.map((i) => ({
          ...i,
          guruhId: i.guruhlarId,
          darsXonaId: i.darsXonalariId,
          fanId: i.fanId,
          oqituvchiId: i.oqituvchilarId,
          guruh: guruhlarRes.find((u) => u.id === i.guruhlarId)?.nomi || '',
          darsXona:
            darsXonasiRes.find((u) => u.id === i.darsXonalariId)?.nomi || '',
          fan: fanlarRes.find((u) => u.id === i.fanId)?.nomi || '',
          oqituvchi:
            oqituvchilarRes.find((u) => u.id === i.oqituvchilarId)?.fio || '',
          isEdited: false,
        }));

        setDarsJadvali(jadval);
        setIsLoading(false);
      } catch (err) {
        console.error('Maʼlumotlarni olishda xatolik:', err);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleGroupChange = (e) => {
    setSelectedGroup(e.target.value);
  };

  const handleAddRow = () => {
    const newRow = {
      id: Date.now(),
      haftaKuni: 1,
      boshlanishVaqti: '',
      tugashVaqti: '',
      paraNomeri: 1,
      darsXonaId: '',
      guruhId: selectedGroup,
      oqituvchiId: '',
      fanId: '',
      darsXona: '',
      guruh: '',
      oqituvchi: '',
      fan: '',
      isNew: true,
      isEdited: false, // Yangi maydon qo'shildi
    };
    setDarsJadvali((prev) => [...prev, newRow]);
  };
  const handleDeleteRow = async (id) => {
    if (window.confirm("Ushbu qatorni o'chirishga ishonchingiz komilmi?")) {
      try {
        // Agar qator yangi qo'shilgan bo'lsa, faqat frontenddan o'chiramiz
        const rowToDelete = darsJadvali.find((item) => item.id === id);

        if (rowToDelete.isNew) {
          setDarsJadvali((prev) => prev.filter((item) => item.id !== id));
        } else {
          // Agar mavjud qator bo'lsa, backenddan ham o'chiramiz
          await DataService.delete(`${ENDPOINTS.DARS_JADVALLARI}/${id}`);
          setDarsJadvali((prev) => prev.filter((item) => item.id !== id));
          alert("Qator muvaffaqiyatli o'chirildi!");
        }
      } catch (err) {
        console.error("Qatorni o'chirishda xatolik:", err);
        alert("Xatolik yuz berdi. Qayta urinib ko'ring.");
      }
    }
  };

  // handleFieldChange ni yaxshiroq versiyasi
  const handleFieldChange = (id, field, value) => {
    setDarsJadvali((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          // Agar guruh, o'qituvchi yoki fan o'zgartirilsa, tegishli nomlarni ham yangilaymiz
          const updates = { [field]: value, isEdited: !item.isNew };

          if (field === 'guruhId') {
            updates.guruh = guruhlar.find((g) => g.id === value)?.nomi || '';
          } else if (field === 'oqituvchiId') {
            updates.oqituvchi =
              oqituvchilar.find((o) => o.id === value)?.fio || '';
          } else if (field === 'fanId') {
            updates.fan = fanlar.find((f) => f.id === value)?.nomi || '';
          } else if (field === 'darsXonaId') {
            updates.darsXona =
              darsXonalari.find((x) => x.id === value)?.nomi || '';
          }

          return { ...item, ...updates };
        }
        return item;
      }),
    );
  };
  // handleSaveChanges funksiyasini quyidagicha o'zgartiring
  const handleSaveChanges = async () => {
    try {
      // Yangi qo'shilgan qatorlarni ajratib olamiz
      const newRows = darsJadvali.filter((item) => item.isNew);
      // Tahrirlangan qatorlarni ajratib olamiz
      const editedRows = darsJadvali.filter(
        (item) => item.isEdited && !item.isNew,
      );
      // O'chirilgan qatorlarni ajratib olamiz (agar kerak bo'lsa)

      // Yangi qatorlarni serverga yuborish
      for (const row of newRows) {
        const payload = {
          haftaKuni: row.haftaKuni,
          boshlanishVaqti: row.boshlanishVaqti,
          tugashVaqti: row.tugashVaqti,
          paraNomeri: row.paraNomeri,
          darsXonalariId: row.darsXonaId,
          guruhlarId: row.guruhId,
          oqituvchilarId: row.oqituvchiId,
          fanId: row.fanId,
        };

        await DataService.post(ENDPOINTS.DARS_JADVALLARI, payload);
      }

      // Tahrirlangan qatorlarni yangilash
      for (const row of editedRows) {
        const payload = {
          haftaKuni: row.haftaKuni,
          boshlanishVaqti: row.boshlanishVaqti,
          tugashVaqti: row.tugashVaqti,
          paraNomeri: row.paraNomeri,
          darsXonalariId: row.darsXonaId,
          guruhlarId: row.guruhId,
          oqituvchilarId: row.oqituvchiId,
          fanId: row.fanId,
        };

        await DataService.xput(
          `${ENDPOINTS.DARS_JADVALLARI}/${row.id}`,
          payload,
        );
      }

      // Ma'lumotlarni qayta yuklash
      const darsJadvallariRes = await DataService.get(
        ENDPOINTS.DARS_JADVALLARI,
      );

      const jadval = darsJadvallariRes.map((i) => ({
        ...i,
        guruhId: i.guruhlarId,
        darsXonaId: i.darsXonalariId,
        fanId: i.fanId,
        oqituvchiId: i.oqituvchilarId,
        guruh: guruhlar.find((u) => u.id === i.guruhlarId)?.nomi || '',
        darsXona:
          darsXonalari.find((u) => u.id === i.darsXonalariId)?.nomi || '',
        fan: fanlar.find((u) => u.id === i.fanId)?.nomi || '',
        oqituvchi:
          oqituvchilar.find((u) => u.id === i.oqituvchilarId)?.fio || '',
        isEdited: false,
      }));

      setDarsJadvali(jadval);
      setEditMode(false);
      alert("O'zgarishlar muvaffaqiyatli saqlandi!");
    } catch (err) {
      console.error("O'zgarishlarni saqlashda xatolik:", err);
      alert("Xatolik yuz berdi. Qayta urinib ko'ring.");
    }
  };

  // handleFieldChange funksiyasini quyidagicha o'zgartiring

  const filteredJadval = (
    selectedGroup === 'all'
      ? darsJadvali
      : darsJadvali.filter((item) => item.guruhId.toString() === selectedGroup)
  ).sort((a, b) => {
    if (a.haftaKuni !== b.haftaKuni) {
      return a.haftaKuni - b.haftaKuni;
    }
    return a.paraNomeri - b.paraNomeri;
  });

  if (isLoading) {
    return <div className="p-4 text-center">Yuklanmoqda...</div>;
  }

  return (
    <div className="p-4">
      <DarsQoshish />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="w-full md:w-auto">
          <label
            htmlFor="group"
            className="block mb-2 text-sm font-medium text-gray-700"
          >
            Guruh bo‘yicha filter:
          </label>
          <select
            id="group"
            className="w-full md:w-64 p-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={selectedGroup}
            onChange={handleGroupChange}
          >
            <option value="all">Barchasi</option>
            {guruhlar.map((guruh) => (
              <option key={guruh.id} value={guruh.id}>
                {guruh.nomi}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4">
          {editMode && (
            <div className="flex gap-2">
              <button
                onClick={handleAddRow}
                className="px-4 py-2 bg-green-600 text-white rounded-md shadow hover:bg-green-700 transition"
              >
                + Qo'shish
              </button>
              <button
                onClick={handleSaveChanges}
                className="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition"
              >
                Saqlash
              </button>
              <button
                onClick={() => setEditMode(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md shadow hover:bg-gray-700 transition"
              >
                Bekor qilish
              </button>
            </div>
          )}

          {!editMode && login && (
            <button
              onClick={() => setEditMode(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition"
            >
              Tahrirlash
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg shadow-lg">
        <table className="min-w-[800px] w-full table-auto border border-gray-200 bg-white text-sm md:text-base">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-2 py-1 md:px-4 md:py-2 border">ID</th>
              <th className="px-2 py-1 md:px-4 md:py-2 border">Guruh</th>
              <th className="px-2 py-1 md:px-4 md:py-2 border">Hafta kuni</th>
              <th className="px-2 py-1 md:px-4 md:py-2 border">Para</th>
              <th className="px-2 py-1 md:px-4 md:py-2 border">Boshlanish</th>
              <th className="px-2 py-1 md:px-4 md:py-2 border">Tugash</th>
              <th className="px-2 py-1 md:px-4 md:py-2 border">Dars xonasi</th>
              <th className="px-2 py-1 md:px-4 md:py-2 border">O'qituvchi</th>
              <th className="px-2 py-1 md:px-4 md:py-2 border">Fan</th>
              {editMode && (
                <th className="px-2 py-1 md:px-4 md:py-2 border">Harakatlar</th>
              )}
            </tr>
          </thead>
          <tbody>
            {filteredJadval.length === 0 ? (
              <tr>
                <td
                  colSpan={editMode ? 10 : 9}
                  className="text-center py-4 text-gray-500"
                >
                  Ma'lumot topilmadi
                </td>
              </tr>
            ) : (
              filteredJadval.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-2 py-1 md:px-4 md:py-2 border text-center">
                    {item.id}
                  </td>
                  <td className="px-2 py-1 md:px-4 md:py-2 border">
                    {editMode ? (
                      <select
                        value={item.guruhId}
                        onChange={(e) => {
                          const selectedGuruh = guruhlar.find(
                            (g) => g.id.toString() === e.target.value,
                          );
                          handleFieldChange(item.id, 'guruhId', e.target.value);
                          handleFieldChange(
                            item.id,
                            'guruh',
                            selectedGuruh?.nomi || '',
                          );
                        }}
                        className="w-full p-1 border rounded"
                      >
                        <option value="">Tanlang</option>
                        {guruhlar.map((guruh) => (
                          <option key={guruh.id} value={guruh.id}>
                            {guruh.nomi}
                          </option>
                        ))}
                      </select>
                    ) : (
                      item.guruh
                    )}
                  </td>
                  <td className="px-2 py-1 md:px-4 md:py-2 border">
                    {editMode ? (
                      <select
                        value={item.haftaKuni}
                        onChange={(e) =>
                          handleFieldChange(
                            item.id,
                            'haftaKuni',
                            parseInt(e.target.value),
                          )
                        }
                        className="w-full p-1 border rounded"
                      >
                        {Object.entries(haftaKunlari).map(([key, value]) => (
                          <option key={key} value={key}>
                            {value}
                          </option>
                        ))}
                      </select>
                    ) : (
                      haftaKunlari[item.haftaKuni]
                    )}
                  </td>
                  <td className="px-2 py-1 md:px-4 md:py-2 border">
                    {editMode ? (
                      <input
                        type="number"
                        min="1"
                        max="8"
                        value={item.paraNomeri}
                        onChange={(e) =>
                          handleFieldChange(
                            item.id,
                            'paraNomeri',
                            parseInt(e.target.value),
                          )
                        }
                        className="w-full p-1 border rounded"
                      />
                    ) : (
                      item.paraNomeri
                    )}
                  </td>
                  <td className="px-2 py-1 md:px-4 md:py-2 border">
                    {editMode ? (
                      <input
                        type="time"
                        value={item.boshlanishVaqti}
                        onChange={(e) =>
                          handleFieldChange(
                            item.id,
                            'boshlanishVaqti',
                            e.target.value,
                          )
                        }
                        className="w-full p-1 border rounded"
                      />
                    ) : (
                      item.boshlanishVaqti
                    )}
                  </td>
                  <td className="px-2 py-1 md:px-4 md:py-2 border">
                    {editMode ? (
                      <input
                        type="time"
                        value={item.tugashVaqti}
                        onChange={(e) =>
                          handleFieldChange(
                            item.id,
                            'tugashVaqti',
                            e.target.value,
                          )
                        }
                        className="w-full p-1 border rounded"
                      />
                    ) : (
                      item.tugashVaqti
                    )}
                  </td>

                  <td className="px-2 py-1 md:px-4 md:py-2 border">
                    {editMode ? (
                      <select
                        value={item.darsXonaId}
                        onChange={(e) => {
                          const selectedXona = darsXonalari.find(
                            (x) => x.id.toString() === e.target.value,
                          );
                          handleFieldChange(
                            item.id,
                            'darsXonaId',
                            e.target.value,
                          );
                          handleFieldChange(
                            item.id,
                            'darsXona',
                            selectedXona?.nomi || '',
                          );
                        }}
                        className="w-full p-1 border rounded"
                      >
                        <option value="">Tanlang</option>
                        {darsXonalari.map((xona) => (
                          <option key={xona.id} value={xona.id}>
                            {xona.nomi}
                          </option>
                        ))}
                      </select>
                    ) : (
                      item.darsXona
                    )}
                  </td>

                  <td className="px-2 py-1 md:px-4 md:py-2 border">
                    {editMode ? (
                      <select
                        value={item.oqituvchiId}
                        onChange={(e) => {
                          const selectedOqituvchi = oqituvchilar.find(
                            (o) => o.id.toString() === e.target.value,
                          );
                          handleFieldChange(
                            item.id,
                            'oqituvchiId',
                            e.target.value,
                          );
                          handleFieldChange(
                            item.id,
                            'oqituvchi',
                            selectedOqituvchi?.fio || '',
                          );
                        }}
                        className="w-full p-1 border rounded"
                      >
                        <option value="">Tanlang</option>
                        {oqituvchilar.map((oqituvchi) => (
                          <option key={oqituvchi.id} value={oqituvchi.id}>
                            {oqituvchi.fio}
                          </option>
                        ))}
                      </select>
                    ) : (
                      item.oqituvchi
                    )}
                  </td>
                  <td className="px-2 py-1 md:px-4 md:py-2 border">
                    {editMode ? (
                      <select
                        value={item.fanId}
                        onChange={(e) => {
                          const selectedFan = fanlar.find(
                            (f) => f.id.toString() === e.target.value,
                          );
                          handleFieldChange(item.id, 'fanId', e.target.value);
                          handleFieldChange(
                            item.id,
                            'fan',
                            selectedFan?.nomi || '',
                          );
                        }}
                        className="w-full p-1 border rounded"
                      >
                        <option value="">Tanlang</option>
                        {fanlar.map((fan) => (
                          <option key={fan.id} value={fan.id}>
                            {fan.nomi}
                          </option>
                        ))}
                      </select>
                    ) : (
                      item.fan
                    )}
                  </td>
                  {editMode && (
                    <td className="px-2 py-1 md:px-4 md:py-2 border text-center">
                      <button
                        onClick={() => handleDeleteRow(item.id)}
                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                      >
                        O'chirish
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DarsJadvali;
