import axios from 'axios';

const api = axios.create({
    baseURL: '/',
    headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
});

export default api;
