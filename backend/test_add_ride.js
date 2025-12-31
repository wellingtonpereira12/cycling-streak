const db = require('./config/db');
const rideController = require('./controllers/rideController');

const testAddRide = async () => {
    // We need to simulate a request object
    // First, get a user id
    const userRes = await db.query('SELECT id FROM usuarios LIMIT 1');
    if (userRes.rows.length === 0) {
        console.error("No users found");
        process.exit(1);
    }
    const userId = userRes.rows[0].id;

    const req = {
        user: { id: userId },
        body: {
            distancia_km: 0.1,
            duracao_seg: 10,
            data_pedal: new Date().toISOString()
        }
    };

    const res = {
        json: (data) => console.log("Success:", data),
        status: (code) => ({
            json: (data) => console.log(`Error ${code}:`, data),
            send: (msg) => console.log(`Error ${code}:`, msg)
        })
    };

    try {
        console.log("Simulating addRide for user:", userId);
        await rideController.addRide(req, res);
    } catch (err) {
        console.error("Caught error:", err);
    } finally {
        process.exit(0);
    }
};

testAddRide();
