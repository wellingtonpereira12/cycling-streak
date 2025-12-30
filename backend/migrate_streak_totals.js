const db = require('./config/db');

const migrate = async () => {
    try {
        console.log("Adding new columns to ofensivas...");
        await db.query(`
            ALTER TABLE ofensivas 
            ADD COLUMN IF NOT EXISTS ofensiva_km_total NUMERIC(10,2) DEFAULT 0,
            ADD COLUMN IF NOT EXISTS ofensiva_tempo_total INTEGER DEFAULT 0;
        `);
        console.log("Migration successful.");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
};

migrate();
