const { Pool } = require('pg');

/**
 * Modul pentru conexiunea la baza de date PostgreSQL.
 * Foloseste un Pool de conexiuni pentru eficienta.
 * Gestioneaza credențialele si configurarea serverului de baze de date.
 */
const pool = new Pool({
    user: 'postgres',
    host: '127.0.0.1',
    database: 'postgres',
    password: 'pass1234',
    port: 5432
});

module.exports = {
    /**
     * Executa o interogare SQL catre baza de date.
     * @param {string} text - Textul interogarii SQL (ex: 'SELECT * FROM users WHERE id = $1').
     * @param {Array} params - Lista de parametri pentru query (ex: [1]).
     * @returns {Promise} - Rezultatul interogarii sub forma de Promise.
     */
    query: (text, params) => pool.query(text, params),
};