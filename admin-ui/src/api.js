import axios from 'axios';

const api = axios.create({
    baseURL: '/api/admin',
    timeout: 10000 // 10 seconds timeout
});

// Interceptor to handle auth token if needed
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Only redirect if we are not already on the login page to prevent infinite loops
        if (error.response && error.response.status === 401 && window.location.pathname !== '/admin/login') {
            window.location.href = '/admin/login';
        }
        return Promise.reject(error);
    }
);

export default api;
