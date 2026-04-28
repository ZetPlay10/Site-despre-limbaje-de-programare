const Router = require('express-promise-router');
const db = require('../db');
const router = new Router();

/**
 * @route GET /api/limbaje
 * @description Returneaza lista tuturor limbajelor cu categoriile lor (agregate).
 * Folosita pentru afisarea initiala sau liste simple.
 */
router.get('/limbaje', async (req, res) => {
    const sql = `
        SELECT L.id_limbaj, L.nume, L.descriere, L.an_aparitie, 
               L.nivel_dificultate, L.logo_url, 
               STRING_AGG(C.nume, ', ') as categorii
        FROM limbaje L
        LEFT JOIN limbaje_categorii LC ON L.id_limbaj = LC.id_limbaj
        LEFT JOIN categorii C ON LC.id_categorie = C.id_categorie
        GROUP BY L.id_limbaj
        ORDER BY L.nume ASC
    `;
    try {
        const result = await db.query(sql);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @route GET /api/limbaje/cautare
 * @description Ruta de cautare avansata si filtrare (folosita in Home.js).
 * Permite filtrarea dupa nume (q), nivel si domeniu (categorie).
 */
router.get('/limbaje/cautare', async (req, res) => {
    try {
        const { q, nivel, domeniu } = req.query;

        let sqlQuery = `
            SELECT L.*, STRING_AGG(C.nume, ', ') as categorii
            FROM limbaje L
            LEFT JOIN limbaje_categorii LC ON L.id_limbaj = LC.id_limbaj
            LEFT JOIN categorii C ON LC.id_categorie = C.id_categorie
            WHERE 1=1
        `;

        let queryParams = [];
        let paramIndex = 1;

        if (q && q.trim() !== '') {
            sqlQuery += ` AND L.nume ILIKE $${paramIndex}`;
            queryParams.push(`%${q}%`);
            paramIndex++;
        }

        if (nivel && nivel !== 'Toate') {
            sqlQuery += ` AND L.nivel_dificultate = $${paramIndex}`;
            queryParams.push(nivel.toLowerCase());
            paramIndex++;
        }

        if (domeniu && domeniu !== 'Toate') {
            sqlQuery += ` AND C.nume ILIKE $${paramIndex}`;
            queryParams.push(`%${domeniu}%`);
            paramIndex++;
        }

        sqlQuery += ` GROUP BY L.id_limbaj ORDER BY L.nume ASC`;

        const result = await db.query(sqlQuery, queryParams);
        res.json(result.rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Eroare la filtrare" });
    }
});

/**
 * @route GET /api/limbaj/:id
 * @description Returneaza detaliile complete ale unui singur limbaj.
 */
router.get('/limbaj/:id', async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM limbaje WHERE id_limbaj = $1", [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Limbaj nu a fost gasit' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @route GET /api/frameworks/:id
 * @description Returneaza framework-urile asociate unui limbaj.
 * @param {id} - ID-ul limbajului (FK).
 */
router.get('/frameworks/:id', async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM framework_uri WHERE id_limbaj = $1", [req.params.id]);

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * @route GET /api/resurse/:id
 * @description Returneaza resursele de invatare asociate unui limbaj.
 * @param {id} - ID-ul limbajului (FK).
 */
router.get('/resurse/:id', async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM resurse WHERE id_limbaj = $1", [req.params.id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;