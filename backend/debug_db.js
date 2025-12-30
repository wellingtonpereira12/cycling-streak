const db = require('./config/db');

const debug = async () => {
    try {
        const res = await db.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'ofensivas'
        `);
        console.log("Columns in 'ofensivas':", res.rows.map(r => r.column_name));
        process.exit(0);
    } catch (err) {
        console.error("Debug failed:", err);
        process.exit(1);
    }
};

debug();
