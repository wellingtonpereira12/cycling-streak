const db = require('./config/db');

const createTablesQuery = `
-- 1. Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha_hash TEXT NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP
);

-- 2. Pedais
CREATE TABLE IF NOT EXISTS pedais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL,
    data_pedal DATE NOT NULL,
    distancia_km NUMERIC(6,2),
    duracao_min INTEGER, -- Legacy
    duracao_seg INTEGER,
    criado_em TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_pedais_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_usuario_data UNIQUE (usuario_id, data_pedal)
);

-- 3. Ofensivas
CREATE TABLE IF NOT EXISTS ofensivas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL UNIQUE,
    ofensiva_atual INTEGER NOT NULL DEFAULT 0,
    ofensiva_recorde INTEGER NOT NULL DEFAULT 0,
    ofensiva_km_total NUMERIC(10,2) DEFAULT 0,
    ofensiva_tempo_total INTEGER DEFAULT 0, -- Legacy
    ofensiva_tempo_total_seg INTEGER DEFAULT 0,
    ultimo_pedal DATE,
    atualizado_em TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_ofensiva_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pedais_usuario ON pedais(usuario_id);
CREATE INDEX IF NOT EXISTS idx_pedais_data ON pedais(data_pedal);
`;

const setup = async () => {
    try {
        console.log("Creating tables...");
        await db.query(createTablesQuery);
        console.log("Tables created successfully.");
        process.exit(0);
    } catch (err) {
        console.error("Error creating tables:", err);
        process.exit(1);
    }
};

setup();
