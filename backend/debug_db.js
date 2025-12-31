const db = require('./config/db');

const debug = async () => {
    try {
        const pedaisCols = await db.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'pedais'
        `);
        console.log("Columns in 'pedais':", pedaisCols.rows.map(r => r.column_name));

        const ofensivasCols = await db.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'ofensivas'
        `);
        console.log("Columns in 'ofensivas':", ofensivasCols.rows.map(r => r.column_name));
        process.exit(0);
    } catch (err) {
        console.error("Debug failed:", err);
        process.exit(1);
    }
};

debug();
