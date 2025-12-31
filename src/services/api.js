import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// NOTE: For Android Emulator, use 'http://10.0.2.2:3000/api'
// For iOS Emulator/Simulator, use 'http://localhost:3000/api'
// For Physical Device, use your computer's IP address e.g. 'http://192.168.1.XX:3000/api'
// Use current machine IP for universal access (Emulator & Physical Device)
//const BASE_URL = 'http://192.168.3.114:3000/api';
// Production URL (Render)
const BASE_URL = 'https://cycling-streak.onrender.com/api';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add token to requests
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
