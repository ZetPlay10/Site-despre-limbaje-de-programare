const Router = require('express-promise-router');
const db = require('../db');
const bcrypt = require('bcrypt');
const router = new Router();

/**
 * @route POST /auth/register
 * @description Inregistreaza un utilizator nou in baza de date.
 * Cripteaza parola inainte de salvare.
 */
router.post('/register', async (req, res) => {
    const { nume, email, parola } = req.body;

    if (!nume || !email || !parola) {
        return res.status(400).json({ message: "Toate campurile sunt obligatorii!" });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const parolaCriptata = await bcrypt.hash(parola, salt);

        const sqlInsert = "INSERT INTO utilizatori (username, email, parola) VALUES ($1, $2, $3) RETURNING *";
        await db.query(sqlInsert, [nume, email, parolaCriptata]);

        res.status(201).json({ message: "Cont creat cu succes!" });
    } catch (err) {
        console.error(err);
        if (err.code === '23505') {
            return res.status(400).json({ message: "Acest email este deja folosit!" });
        }
        res.status(500).json({ message: "Eroare la inregistrare: " + err.message });
    }
});

/**
 * @route POST /auth/login
 * @description Autentifica utilizatorul.
 * Verifica email-ul si compara parola hash-uita. Returneaza datele utilizatorului (fara parola).
 */
router.post('/login', async (req, res) => {
    const { email, parola } = req.body;

    try {
        const result = await db.query("SELECT * FROM utilizatori WHERE email = $1", [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ message: "Email sau parola gresita!" });
        }

        const user = result.rows[0];

        const validPassword = await bcrypt.compare(parola, user.parola);

        if (!validPassword) {
            return res.status(401).json({ message: "Email sau parola gresita!" });
        }

        res.json({
            id: user.id_utilizator,
            nume: user.username,
            email: user.email,
            rol: user.rol
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Eroare server!" });
    }
});

module.exports = router;