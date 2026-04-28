const express = require('express');
const cors = require('cors');
const app = express();

/**
 * --- IMPORT RUTE ---
 * Asigura-te ca fisierele exista in folderul 'routes'
 */
const authRoutes = require('./routes/auth');
const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');

app.use(cors());
app.use(express.json());

/**
 * --- MONTARE RUTE ---
 */

app.use('/auth', authRoutes);

app.use('/api', publicRoutes);

app.use('/', adminRoutes);

const PORT = 8081;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});