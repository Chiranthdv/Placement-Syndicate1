import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.response.use(res => res, error => {
  console.error('API Error:', error.response?.data || error.message);
  return Promise.reject(error);
});

// User Service
export const getMyProfile = () => api.get('/users/me');
export const getUserById = (id) => api.get(`/users/${id}`);
export const registerUser = (data) => api.post('/users/register', data);
export const login = (data) => api.post('/auth/login', data);
export const signup = (data) => api.post('/auth/signup', data);

// Experience Service
export const getExperienceById = (id) => api.get(`/experience/${id}`);
export const getMyExperiences = () => api.get('/experience/me');
export const registerExperience = (data) => api.post('/experience/register', data);
export const getAllCompanies = () => api.get('/experience/companies');
export const getByCompanyName = (name) => api.get(`/experience/company/${name}`);
export const deleteExperience = (id) => api.delete(`/experience/delete/${id}`);
export const deleteExperienceByAdmin = (id) => api.delete(`/experience/admin/${id}`);

export default api;
