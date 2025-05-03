// src/constants/endpoints.js

const ENDPOINTS = {
  TALABALAR: '/talabalar',
  OQITUVCHILAR: '/oqituvchilar',
  GURUHLAR: '/guruhlar',
  FANLAR: '/fanlar',
  DARS_JADVALLARI: '/darsJadvallari',
  DARS_XONALARI: '/darsXonalari',
  OQITUVCHILARDETAILS: (id) => `oqituvchilar/${id}`,
  TALABALARDETAILS: (id) => `/talabalar/${id}`,
  FOYDALANUVCHILAR: '/foydalanuvchilar',
};
/*T: (id) => `/users/${id}/`,*/
export default ENDPOINTS;
