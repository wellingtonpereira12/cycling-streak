const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

const runTest = async () => {
    try {
        const email = `test${Math.floor(Math.random() * 10000)}@example.com`;
        const password = 'password123';

        console.log(`1. Registering user: ${email}`);
        const regRes = await axios.post(`${BASE_URL}/auth/register`, {
            nome: 'Test User',
            email,
            password
        });
        console.log('   Success:', regRes.status);
        const token = regRes.data.token;

        console.log('2. Logging in');
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email,
            password
        });
        console.log('   Success:', loginRes.status);

        console.log('3. Registering Ride (Today)');
        const rideRes = await axios.post(`${BASE_URL}/rides`, {
            distancia_km: 20.5,
            duracao_min: 60,
            data_pedal: new Date().toISOString().split('T')[0] // Today
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('   Success:', rideRes.data);

        console.log('4. Checking Dashboard');
        const dashRes = await axios.get(`${BASE_URL}/rides/dashboard`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('   Streak:', dashRes.data.streak);
        console.log('   Recent Rides:', dashRes.data.recentRides.length);

        console.log('ALL TESTS PASSED');

    } catch (err) {
        console.error('TEST FAILED:', err.response ? err.response.data : err.message);
    }
};

runTest();
