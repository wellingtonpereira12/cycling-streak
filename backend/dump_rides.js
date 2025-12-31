const db = require('./config/db');

const dumpRides = async () => {
    try {
        const res = await db.query(`
            SELECT * FROM pedais
            ORDER BY criado_em DESC
        `);
        console.log("All rides in pedais table:");
        console.table(res.rows);
        const countRes = await db.query('SELECT COUNT(*) FROM pedais');
        console.log("Total rides in DB:", countRes.rows[0].count);
        process.exit(0);

        const ofensivasRes = await db.query(`
            SELECT * FROM ofensivas
            ORDER BY atualizado_em DESC
            LIMIT 5
        `);
        console.log("Ofensivas data:");
        console.table(ofensivasRes.rows);

        const lastUser = await db.query('SELECT email FROM usuarios ORDER BY criado_em DESC LIMIT 1');
        console.log("Last user registered:", lastUser.rows[0]?.email);
        process.exit(0);
    } catch (err) {
        console.error("Dump failed:", err);
        process.exit(1);
    }
};

dumpRides();
