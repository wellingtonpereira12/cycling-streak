const db = require('./config/db');

const testQuery = async () => {
    const usuario_id = 'c82aa023-67ef-9e1e-fe80-67ef9e1e9e1e'; // Just a placeholder to check syntax
    try {
        console.log("Testing dynamic query...");
        const query = `
            WITH user_ofensiva AS (
                SELECT * FROM ofensivas LIMIT 1
            ),
            totals AS (
                SELECT 
                    COALESCE(SUM(distancia_km), 0) as km_total,
                    COALESCE(SUM(duracao_min), 0) as tempo_total
                FROM (
                    SELECT distancia_km, duracao_min
                    FROM pedais
                    WHERE usuario_id = (SELECT usuario_id FROM user_ofensiva)
                    ORDER BY data_pedal DESC
                    LIMIT (SELECT ofensiva_atual FROM user_ofensiva)
                ) as last_rides
            )
            SELECT u.*, t.km_total, t.tempo_total
            FROM user_ofensiva u, totals t
        `;
        const res = await db.query(query);
        console.log("Query success:", res.rows[0]);
        process.exit(0);
    } catch (err) {
        console.error("Query FAILED:", err);
        process.exit(1);
    }
};

testQuery();
