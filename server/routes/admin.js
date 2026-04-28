const Router = require('express-promise-router');
const db = require('../db');
const router = new Router();

/**
 * @route GET /admin/stats
 */
router.get('/admin/stats', async (req, res) => {
    try {
        const stats = await Promise.all([
            db.query("SELECT COUNT(*) as val FROM UTILIZATORI"),
            db.query("SELECT COUNT(*) as val FROM LIMBAJE"),
            db.query("SELECT COUNT(*) as val FROM FRAMEWORK_URI"),
            db.query("SELECT COUNT(*) as val FROM RESURSE")
        ]);

        res.json({
            utilizatori: stats[0].rows[0].val,
            limbaje: stats[1].rows[0].val,
            recenzii: stats[2].rows[0].val,
            resurse: stats[3].rows[0].val
        });
    } catch (err) {
        res.status(500).json({ message: "Eroare statistici." });
    }
});

/**
 * @route GET /admin/users
 */
router.get('/admin/users', async (req, res) => {
    try {
        const result = await db.query("SELECT id_utilizator, email, rol FROM UTILIZATORI ORDER BY id_utilizator");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @route DELETE /admin/users/:id
 */
router.delete('/admin/users/:id', async (req, res) => {
    try {
        await db.query("DELETE FROM UTILIZATORI WHERE id_utilizator = $1", [req.params.id]);
        res.json({ message: "Utilizator sters!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @route POST /admin/limbaje
 */
router.post('/admin/limbaje', async (req, res) => {
    const { nume, descriere, an_aparitie, nivel_dificultate, logo_url } = req.body;
    try {
        const sql = `
            INSERT INTO LIMBAJE (nume, descriere, an_aparitie, nivel_dificultate, logo_url)
            VALUES ($1, $2, $3, $4, $5) RETURNING *
        `;
        const result = await db.query(sql, [nume, descriere, an_aparitie, nivel_dificultate, logo_url]);
        res.status(201).json({ message: "Limbaj adaugat!", limbaj: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Eroare server." });
    }
});

/**
 * @route POST /admin/frameworks
 */
router.post('/admin/frameworks', async (req, res) => {
    const { id_limbaj, nume, descriere, tip } = req.body;
    try {
        await db.query(
            "INSERT INTO FRAMEWORK_URI (id_limbaj, nume, descriere, tip) VALUES ($1, $2, $3, $4)",
            [id_limbaj, nume, descriere, tip]
        );
        res.status(201).json({ message: "Framework adaugat!" });
    } catch (err) {
        res.status(500).json({ message: "Eroare server." });
    }
});

/**
 * @route POST /admin/resurse
 */
router.post('/admin/resurse', async (req, res) => {
    const { id_limbaj, titlu, link, tip, nivel_dificultate } = req.body;
    try {
        await db.query(
            "INSERT INTO RESURSE (id_limbaj, titlu, link, tip, nivel_dificultate) VALUES ($1, $2, $3, $4, $5)",
            [id_limbaj, titlu, link, tip, nivel_dificultate]
        );
        res.status(201).json({ message: "Resursa adaugata!" });
    } catch (err) {
        res.status(500).json({ message: "Eroare server." });
    }
});

/**
 * @route DELETE /admin/limbaje/:id
 */
router.delete('/admin/limbaje/:id', async (req, res) => {
    try {
        const id = req.params.id;
        await db.query("DELETE FROM FRAMEWORK_URI WHERE id_limbaj = $1", [id]);
        await db.query("DELETE FROM RESURSE WHERE id_limbaj = $1", [id]);
        await db.query("DELETE FROM LIMBAJE WHERE id_limbaj = $1", [id]);
        res.json({ message: "Limbaj sters complet!" });
    } catch (err) {
        res.status(500).json({ error: "Eroare la stergere." });
    }
});

/**
 * @route PUT /admin/limbaje/:id
 */
router.put('/admin/limbaje/:id', async (req, res) => {
    const { nume, descriere, an_aparitie, nivel_dificultate, logo_url } = req.body;
    try {
        await db.query(
            "UPDATE LIMBAJE SET nume=$1, descriere=$2, an_aparitie=$3, nivel_dificultate=$4, logo_url=$5 WHERE id_limbaj=$6",
            [nume, descriere, an_aparitie, nivel_dificultate, logo_url, req.params.id]
        );
        res.json({ message: "Limbaj actualizat!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

/**
 * @route PUT /admin/users/:id
 */
router.put('/admin/users/:id', async (req, res) => {
    const { email, rol } = req.body;
    try {
        await db.query(
            "UPDATE UTILIZATORI SET email=$1, rol=$2 WHERE id_utilizator=$3",
            [email, rol, req.params.id]
        );
        res.json({ message: "Utilizator actualizat!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

/**
 * @route GET /admin/raport-complet
 * @description Executa 30 de interogari SQL si returneaza datele agregate pentru PDF.
 */
router.get('/admin/raport-complet', async (req, res) => {
    try {
        const results = {};

        const stats = await Promise.all([
            db.query("SELECT COUNT(*) as val FROM UTILIZATORI"),
            db.query("SELECT COUNT(*) as val FROM LIMBAJE"),
            db.query("SELECT COUNT(*) as val FROM FRAMEWORK_URI"),
            db.query("SELECT COUNT(*) as val FROM RESURSE"),
            db.query("SELECT COUNT(*) as val FROM MENTORI"),
            db.query("SELECT COUNT(*) as val FROM RECENZII"),
            db.query("SELECT COUNT(*) as val FROM CATEGORII"),
            db.query("SELECT COUNT(*) as val FROM UTILIZATORI WHERE rol = 'admin'")
        ]);

        results.stats = {
            total_users: stats[0].rows[0].val,
            total_limbaje: stats[1].rows[0].val,
            total_frameworks: stats[2].rows[0].val,
            total_resurse: stats[3].rows[0].val,
            total_mentori: stats[4].rows[0].val,
            total_recenzii: stats[5].rows[0].val,
            total_categorii: stats[6].rows[0].val,
            total_admini: stats[7].rows[0].val
        };

        const filters = await Promise.all([
            db.query("SELECT nume, an_aparitie FROM LIMBAJE WHERE nivel_dificultate = 'incepator'"),
            db.query("SELECT nume, an_aparitie FROM LIMBAJE WHERE nivel_dificultate = 'avansat'"),
            db.query("SELECT nume, an_aparitie FROM LIMBAJE WHERE an_aparitie < 2000"),
            db.query("SELECT nume, descriere FROM FRAMEWORK_URI WHERE tip = 'web'"),
            db.query("SELECT titlu, link FROM RESURSE WHERE tip = 'video'"),
            db.query("SELECT nume_complet, ani_experienta FROM MENTORI WHERE ani_experienta > 5"),
            db.query("SELECT comentariu, rating FROM RECENZII WHERE rating = 5")
        ]);

        results.limbaje_incepatori = filters[0].rows;
        results.limbaje_avansati = filters[1].rows;
        results.limbaje_vechi = filters[2].rows;
        results.frameworks_web = filters[3].rows;
        results.resurse_video = filters[4].rows;
        results.mentori_seniori = filters[5].rows;
        results.recenzii_top = filters[6].rows;

        const sorts = await Promise.all([
            db.query("SELECT nume, an_aparitie FROM LIMBAJE ORDER BY an_aparitie ASC LIMIT 1"),
            db.query("SELECT nume, an_aparitie FROM LIMBAJE ORDER BY an_aparitie DESC LIMIT 1"),
            db.query("SELECT nume_complet, ani_experienta FROM MENTORI ORDER BY ani_experienta DESC LIMIT 3"),
            db.query("SELECT username, email, data_inregistrare FROM UTILIZATORI ORDER BY data_inregistrare DESC LIMIT 5"),
            db.query("SELECT titlu FROM RESURSE WHERE nivel_dificultate = 'avansat' LIMIT 5")
        ]);

        results.cel_mai_vechi_limbaj = sorts[0].rows;
        results.cel_mai_nou_limbaj = sorts[1].rows;
        results.top_mentori_exp = sorts[2].rows;
        results.ultimii_useri = sorts[3].rows;
        results.resurse_dificile = sorts[4].rows;

        results.nr_frameworks_per_limbaj = (await db.query("SELECT l.nume, COUNT(f.id_framework) as nr FROM LIMBAJE l LEFT JOIN FRAMEWORK_URI f ON l.id_limbaj = f.id_limbaj GROUP BY l.nume")).rows;
        results.frameworks_cu_limbaj = (await db.query("SELECT f.nume as framework, l.nume as limbaj, f.tip FROM FRAMEWORK_URI f JOIN LIMBAJE l ON f.id_limbaj = l.id_limbaj")).rows;
        results.resurse_per_limbaj = (await db.query("SELECT l.nume, COUNT(r.id_resursa) as nr FROM LIMBAJE l LEFT JOIN RESURSE r ON l.id_limbaj = r.id_limbaj GROUP BY l.nume")).rows;
        results.rating_mediu_limbaj = (await db.query("SELECT l.nume, AVG(rec.rating) as medie FROM LIMBAJE l JOIN RECENZII rec ON l.id_limbaj = rec.id_limbaj GROUP BY l.nume")).rows;
        results.mentori_si_limbaje = (await db.query("SELECT m.nume_complet, l.nume as limbaj FROM MENTORI m JOIN MENTORI_LIMBAJE ml ON m.id_mentor = ml.id_mentor JOIN LIMBAJE l ON ml.id_limbaj = l.id_limbaj")).rows;
        results.useri_activi_recenzii = (await db.query("SELECT DISTINCT u.username FROM UTILIZATORI u JOIN RECENZII r ON u.id_utilizator = r.id_utilizator")).rows;
        results.categorii_stats = (await db.query("SELECT c.nume, COUNT(lc.id_limbaj) as nr FROM CATEGORII c JOIN LIMBAJE_CATEGORII lc ON c.id_categorie = lc.id_categorie GROUP BY c.nume")).rows;
        results.limbaje_cu_frameworks = (await db.query("SELECT DISTINCT l.nume FROM LIMBAJE l JOIN FRAMEWORK_URI f ON l.id_limbaj = f.id_limbaj")).rows;
        results.mentorat_activ = (await db.query("SELECT u.username as student, m.nume_complet as mentor FROM MENTORAT mt JOIN UTILIZATORI u ON mt.id_utilizator = u.id_utilizator JOIN MENTORI m ON mt.id_mentor = m.id_mentor WHERE mt.data_sfarsit IS NULL")).rows;
        results.frameworks_specializate = (await db.query("SELECT nume FROM FRAMEWORK_URI WHERE tip IN ('data science', 'mobile')")).rows;

        res.json(results);

    } catch (err) {
        console.error("Eroare raport complet:", err);
        res.status(500).json({ error: "Eroare la generarea raportului." });
    }
});

module.exports = router;