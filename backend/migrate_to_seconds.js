const db = require('./config/db');

const migrate = async () => {
    try {
        console.log("Starting migration: duracao_min to duracao_seg");

        // 1. Add duracao_seg column
        await db.query(`
            ALTER TABLE pedais 
            ADD COLUMN IF NOT EXISTS duracao_seg INTEGER;
        `);
        console.log("- Added duracao_seg column");

        // 2. Map existing minutes to seconds
        await db.query(`
            UPDATE pedais 
            SET duracao_seg = duracao_min * 60 
            WHERE duracao_seg IS NULL AND duracao_min IS NOT NULL;
        `);
        console.log("- Migrated existing data (min to sec)");

        // 3. Update ofensivas column as well for consistency if we use it for totals
        await db.query(`
            ALTER TABLE ofensivas 
            ADD COLUMN IF NOT EXISTS ofensiva_tempo_total_seg INTEGER DEFAULT 0;
        `);

        // Populate it from existing total in minutes
        await db.query(`
            UPDATE ofensivas 
            SET ofensiva_tempo_total_seg = ofensiva_tempo_total * 60 
            WHERE ofensiva_tempo_total_seg = 0 AND ofensiva_tempo_total > 0;
        `);
        console.log("- Updated ofensivas table");

        console.log("Migration successful.");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
};

migrate();
