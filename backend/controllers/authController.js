const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

exports.register = async (req, res) => {
    const { nome, email, password } = req.body;
    try {
        let userCheck = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const senha_hash = await bcrypt.hash(password, salt);

        // Transaction to create user and init streak table
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');
            const resUser = await client.query(
                'INSERT INTO usuarios (nome, email, senha_hash) VALUES ($1, $2, $3) RETURNING id',
                [nome, email, senha_hash]
            );
            const userId = resUser.rows[0].id;

            await client.query(
                'INSERT INTO ofensivas (usuario_id, ofensiva_atual, ofensiva_recorde) VALUES ($1, 0, 0)',
                [userId]
            );
            await client.query('COMMIT');

            const payload = { user: { id: userId } };
            jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: userId, nome, email } });
            });

        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const userRes = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (userRes.rows.length === 0) {
            console.log(`Login failed: User not found for email ${email}`);
            return res.status(404).json({ msg: 'User not found' });
        }

        const user = userRes.rows[0];
        const isMatch = await bcrypt.compare(password, user.senha_hash);
        if (!isMatch) {
            console.log(`Login failed: Password mismatch for email ${email}`);
            return res.status(401).json({ msg: 'Invalid Credentials' });
        }

        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, nome: user.nome, email: user.email } });
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
