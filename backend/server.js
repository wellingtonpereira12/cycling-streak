const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors()); // Allow all for now, or configure specific origin
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.send('Cycling Streak API Running');
});

// Manual DB Setup Route
app.get('/setup-db', async (req, res) => {
    try {
        const db = require('./config/db');
        const createTablesQuery = `
        CREATE TABLE IF NOT EXISTS usuarios (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            nome VARCHAR(100) NOT NULL,
            email VARCHAR(150) NOT NULL UNIQUE,
            senha_hash TEXT NOT NULL,
            criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
            atualizado_em TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS pedais (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            usuario_id UUID NOT NULL,
            data_pedal DATE NOT NULL,
            distancia_km NUMERIC(6,2),
            duracao_min INTEGER, -- Legacy
            duracao_seg INTEGER,
            criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
            CONSTRAINT fk_pedais_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
            CONSTRAINT uq_usuario_data UNIQUE (usuario_id, data_pedal)
        );
        CREATE TABLE IF NOT EXISTS ofensivas (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            usuario_id UUID NOT NULL UNIQUE,
            ofensiva_atual INTEGER NOT NULL DEFAULT 0,
            ofensiva_recorde INTEGER NOT NULL DEFAULT 0,
            ofensiva_km_total NUMERIC(10,2) DEFAULT 0,
            ofensiva_tempo_total_seg INTEGER DEFAULT 0,
            ultimo_pedal DATE,
            atualizado_em TIMESTAMP NOT NULL DEFAULT NOW(),
            CONSTRAINT fk_ofensiva_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_pedais_usuario ON pedais(usuario_id);
        CREATE INDEX IF NOT EXISTS idx_pedais_data ON pedais(data_pedal);
        `;
        await db.query(createTablesQuery);
        res.send('Database tables created successfully!');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating tables: ' + error.message);
    }
});
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/rides', require('./routes/rideRoutes'));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server v2 (Seconds Precision) running on port ${PORT}`);
    console.log(`Current time: ${new Date().toISOString()}`);
});
