const db = require('../config/db');

exports.addRide = async (req, res) => {
    const { distancia_km, duracao_min, data_pedal } = req.body;
    const usuario_id = req.user.id;
    // data_pedal expected validation or default to today? user said "Insere novo registro em pedais"
    // We assume data_pedal is passed or we use current date.
    // However, for streak logic, we must use the date of the ride.

    // date validation
    const rideDate = data_pedal ? new Date(data_pedal) : new Date();
    // Normalize to YYYY-MM-DD for consistency
    const rideDateStr = rideDate.toISOString().split('T')[0];

    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Check if ride already exists for today
        const existingRide = await client.query(
            'SELECT * FROM pedais WHERE usuario_id = $1 AND data_pedal = $2',
            [usuario_id, rideDateStr]
        );
        const isUpdate = existingRide.rows.length > 0;

        // 2. Insert or Update pedais (UPSERT)
        await client.query(
            `INSERT INTO pedais (usuario_id, data_pedal, distancia_km, duracao_min) 
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (usuario_id, data_pedal) 
             DO UPDATE SET distancia_km = $3, duracao_min = $4`,
            [usuario_id, rideDateStr, distancia_km, duracao_min]
        );

        // 3. Read ofensivas stats
        const resOfensiva = await client.query('SELECT * FROM ofensivas WHERE usuario_id = $1', [usuario_id]);
        let { ofensiva_atual, ofensiva_recorde, ultimo_pedal } = resOfensiva.rows[0];

        let newStreak = ofensiva_atual;
        let newRecord = ofensiva_recorde;

        // Only recalculate streak if this is a NEW ride (not an update)
        if (!isUpdate) {
            if (ultimo_pedal) {
                // Calculate difference in days
                const lastDate = new Date(ultimo_pedal);
                const currentRideDate = new Date(rideDateStr);

                // Time diff in millis
                const diffTime = Math.abs(currentRideDate - lastDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays === 1) {
                    // Consecutive day
                    newStreak += 1;
                } else if (diffDays === 2 || diffDays === 3) {
                    // Grace period - maintain streak (2 or 3 days)
                    // newStreak remains same
                } else if (diffDays >= 4) {
                    // Lost streak, restart
                    newStreak = 1;
                }
            } else {
                // First ride ever
                newStreak = 1;
            }

            // Update record if broken
            if (newStreak > ofensiva_recorde) {
                newRecord = newStreak;
            }

            // 4. Update ofensivas (only if new ride)
            await client.query(
                `UPDATE ofensivas 
                 SET ofensiva_atual = $1, ofensiva_recorde = $2, ultimo_pedal = $3, 
                     atualizado_em = NOW() 
                 WHERE usuario_id = $4`,
                [newStreak, newRecord, rideDateStr, usuario_id]
            );
        }

        await client.query('COMMIT');

        res.json({
            msg: 'Ride registered',
            streak: newStreak,
            record: newRecord
        });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).send('Server error');
    } finally {
        client.release();
    }
};

exports.getHistory = async (req, res) => {
    const usuario_id = req.user.id;
    try {
        const result = await db.query(
            'SELECT * FROM pedais WHERE usuario_id = $1 ORDER BY data_pedal DESC',
            [usuario_id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.getDashboard = async (req, res) => {
    const usuario_id = req.user.id;
    try {
        // Dynamic query: Sum only the last N rides where N = ofensiva_atual
        const query = `
            WITH user_ofensiva AS (
                SELECT * FROM ofensivas WHERE usuario_id = $1
            ),
            totals AS (
                SELECT 
                    COALESCE(SUM(distancia_km), 0) as km_total,
                    COALESCE(SUM(duracao_min), 0) as tempo_total
                FROM (
                    SELECT distancia_km, duracao_min
                    FROM pedais
                    WHERE usuario_id = $1
                    ORDER BY data_pedal DESC
                    LIMIT (SELECT ofensiva_atual FROM user_ofensiva)
                ) as last_rides
            )
            SELECT u.*, t.km_total, t.tempo_total
            FROM user_ofensiva u, totals t
        `;

        const ofensivaRes = await db.query(query, [usuario_id]);
        const pedaisRes = await db.query('SELECT * FROM pedais WHERE usuario_id = $1 ORDER BY data_pedal DESC LIMIT 7', [usuario_id]);

        res.json({
            streak: ofensivaRes.rows[0],
            recentRides: pedaisRes.rows
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
