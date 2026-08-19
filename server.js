const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const fs = require('fs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// EJS Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static Folders
app.use(express.static(path.join(__dirname, 'public')));
app.use('/admin', express.static(path.join(__dirname, 'public', 'admin')));

// Direct imports for bundler analysis
const adminRoutes = require('./routes/admin');
const publicRoutes = require('./routes/public');
const db = require('./models');

// Helper to seed /tmp DB on Vercel if needed
let initialized = false;
const ensureDbInit = async () => {
    if (initialized) return;
    if (process.env.VERCEL) {
        const tmpDb = '/tmp/database.sqlite';
        const sourceDb = path.join(__dirname, 'database.sqlite');
        if (!fs.existsSync(tmpDb) && fs.existsSync(sourceDb)) {
            try {
                fs.copyFileSync(sourceDb, tmpDb);
            } catch (e) {
                console.error('Failed to copy db to /tmp:', e);
            }
        }
    }
    await db.sequelize.sync({ force: false });
    initialized = true;
};

// Middleware to ensure DB is initialized
app.use(async (req, res, next) => {
    try {
        await ensureDbInit();
        next();
    } catch (e) {
        next(e);
    }
});

// Routes
app.use('/api/admin', adminRoutes);
app.use('/', publicRoutes);

// Catch-all for React Admin Panel
app.get(/^\/admin(?:\/(.*))?$/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Express Error Handler:', err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Local Development server listener
if (!process.env.VERCEL) {
    db.sequelize.sync({ force: false }).then(async () => {
        console.log('Database synced successfully.');
        const qi = db.sequelize.getQueryInterface();
        try {
            const cols = await qi.describeTable('Products');
            const migrations = [
                { col: 'stock', sql: 'ALTER TABLE "Products" ADD COLUMN "stock" INTEGER DEFAULT 0' },
                { col: 'specs',  sql: 'ALTER TABLE "Products" ADD COLUMN "specs" TEXT' },
            ];
            for (const m of migrations) {
                if (!cols[m.col]) {
                    await db.sequelize.query(m.sql);
                    console.log(`Migration: added column Products.${m.col}`);
                }
            }
        } catch (migErr) {
            console.error('Migration warning (non-fatal):', migErr.message);
        }

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    }).catch(err => {
        console.error('Failed to sync database:', err);
    });
}

module.exports = app;
