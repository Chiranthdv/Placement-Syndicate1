import api from './api';

export const uploadResume = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/resume/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const getResumeFeedback = (filename) => api.get(`/resume/feedback/${filename}`);
export const getSimilarCompanies = (companyName, limit = 5) => api.get(`/resume/similar/${companyName}?limit=${limit}`);
