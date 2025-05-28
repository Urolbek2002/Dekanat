import { isConflict, getAvailableResources } from '../config/scheduleUtils';
import { useState, useEffect, useMemo } from 'react';
import { DataService } from '../config/DataService';
import ENDPOINTS from '../config/endpoints';

const initialForm = {
  haftaKuni: 1,
  boshlanishVaqti: '',
  tugashVaqti: '',
  paraNomeri: 1,
  darsXonalariId: '',
  guruhlarId: '',
  oqituvchilarId: '',
  fanId: '',
};

const ScheduleForm = () => {
  const [formData, setFormData] = useState(initialForm);
  const [scheduleList, setScheduleList] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dropdownData, setDropdownData] = useState({
    darsXonalari: [],
    guruhlar: [],
    oqituvchilar: [],
    fanlar: [],
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [schedules, rooms, groups, teachers, subjects] =
          await Promise.all([
            DataService.get(ENDPOINTS.DARS_JADVALLARI),
            DataService.get(ENDPOINTS.DARS_XONALARI),
            DataService.get(ENDPOINTS.GURUHLAR),
            DataService.get(ENDPOINTS.OQITUVCHILAR),
            DataService.get(ENDPOINTS.FANLAR),
          ]);

        setScheduleList(schedules);
        setDropdownData({
          darsXonalari: rooms,
          guruhlar: groups,
          oqituvchilar: teachers,
          fanlar: subjects,
        });
      } catch (err) {
        console.error('Failed to fetch initial data:', err);
        setError('Maʼlumotlarni yuklashda xatolik yuz berdi');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Calculate available resources based on current form data
  const availableResources = useMemo(() => {
    if (!formData.boshlanishVaqti || !formData.tugashVaqti) {
      return {
        availableRooms: new Set(),
        availableTeachers: new Set(),
        availableGroups: new Set(),
      };
    }

    const newItem = {
      ...formData,
      paraNomeri: +formData.paraNomeri,
      haftaKuni: +formData.haftaKuni,
    };

    return getAvailableResources(newItem, scheduleList);
  }, [formData, scheduleList]);

  // Filter dropdown options based on availability
  const filteredDropdownData = useMemo(() => {
    return {
      darsXonalari: dropdownData.darsXonalari.filter(
        (room) => !availableResources.availableRooms.has(room.id),
      ),
      guruhlar: dropdownData.guruhlar.filter(
        (group) => !availableResources.availableGroups.has(group.id),
      ),
      oqituvchilar: dropdownData.oqituvchilar.filter(
        (teacher) => !availableResources.availableTeachers.has(teacher.id),
      ),
      fanlar: dropdownData.fanlar, // Subjects don't need filtering
    };
  }, [dropdownData, availableResources]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const newItem = {
      ...formData,
      paraNomeri: +formData.paraNomeri,
      haftaKuni: +formData.haftaKuni,
    };

    if (isConflict(newItem, scheduleList)) {
      setError('Konflikt mavjud: vaqt, o‘qituvchi, guruh yoki darsxona band.');
      return;
    }

    try {
      setLoading(true);
      const createdItem = await DataService.post(
        ENDPOINTS.DARS_JADVALLARI,
        newItem,
      );
      setScheduleList((prev) => [...prev, createdItem]);
      setFormData(initialForm);
    } catch (err) {
      console.error(err);
      setError('Serverda xatolik yuz berdi!');
    } finally {
      setLoading(false);
    }
  };

  if (loading && scheduleList.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Dars Jadvalini Qo'shish
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Weekday Select */}
          <div>
            <label
              htmlFor="haftaKuni"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Hafta Kuni
            </label>
            <select
              id="haftaKuni"
              name="haftaKuni"
              onChange={handleChange}
              value={formData.haftaKuni}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={1}>Dushanba</option>
              <option value={2}>Seshanba</option>
              <option value={3}>Chorshanba</option>
              <option value={4}>Payshanba</option>
              <option value={5}>Juma</option>
              <option value={6}>Shanba</option>
            </select>
          </div>

          {/* Lesson Number */}
          <div>
            <label
              htmlFor="paraNomeri"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Para Nomeri
            </label>
            <input
              type="number"
              id="paraNomeri"
              name="paraNomeri"
              value={formData.paraNomeri}
              onChange={handleChange}
              min={1}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Start Time */}
          <div>
            <label
              htmlFor="boshlanishVaqti"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Boshlanish Vaqti
            </label>
            <input
              type="time"
              id="boshlanishVaqti"
              name="boshlanishVaqti"
              value={formData.boshlanishVaqti}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* End Time */}
          <div>
            <label
              htmlFor="tugashVaqti"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tugash Vaqti
            </label>
            <input
              type="time"
              id="tugashVaqti"
              name="tugashVaqti"
              value={formData.tugashVaqti}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Classroom Dropdown */}
          <div>
            <label
              htmlFor="darsXonalariId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Darsxona
            </label>
            <select
              id="darsXonalariId"
              name="darsXonalariId"
              value={formData.darsXonalariId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tanlang</option>
              {filteredDropdownData.darsXonalari.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.nomi}
                </option>
              ))}
            </select>
          </div>

          {/* Group Dropdown */}
          <div>
            <label
              htmlFor="guruhlarId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Guruh
            </label>
            <select
              id="guruhlarId"
              name="guruhlarId"
              value={formData.guruhlarId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tanlang</option>
              {filteredDropdownData.guruhlar.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.nomi}
                </option>
              ))}
            </select>
          </div>

          {/* Teacher Dropdown */}
          <div>
            <label
              htmlFor="oqituvchilarId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              O'qituvchi
            </label>
            <select
              id="oqituvchilarId"
              name="oqituvchilarId"
              value={formData.oqituvchilarId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tanlang</option>
              {filteredDropdownData.oqituvchilar.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.fio}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Dropdown */}
          <div>
            <label
              htmlFor="fanId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Fan
            </label>
            <select
              id="fanId"
              name="fanId"
              value={formData.fanId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tanlang</option>
              {filteredDropdownData.fanlar.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.nomi}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 rounded-md text-white ${
              loading ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'
            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
          >
            {loading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Kuting...
              </span>
            ) : (
              "Qo'shish"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ScheduleForm;
