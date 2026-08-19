const express = require('express');
const router = express.Router();
const db = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

const JWT_SECRET = process.env.JWT_SECRET || 'rk_steel_super_secret_key_123';

const { put } = require('@vercel/blob');

const os = require('os');

// Multer setup for image uploads
const storage = process.env.BLOB_READ_WRITE_TOKEN 
    ? multer.memoryStorage() 
    : multer.diskStorage({
        destination: (req, file, cb) => { 
            // If on Vercel but no Blob token, use /tmp to avoid EROFS crash (temporary workaround)
            const dest = process.env.VERCEL ? os.tmpdir() : 'public/assets';
            cb(null, dest); 
        },
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname).toLowerCase();
            cb(null, 'product_' + Date.now() + ext);
        }
    });

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|webp/;
        const ok = allowed.test(file.mimetype) && allowed.test(path.extname(file.originalname).toLowerCase());
        ok ? cb(null, true) : cb(new Error('Only image files are allowed'));
    },
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Helper to handle upload to Blob or return local filename
const processImageUpload = async (reqFile) => {
    if (!reqFile) return null;
    if (process.env.BLOB_READ_WRITE_TOKEN) {
        const ext = path.extname(reqFile.originalname).toLowerCase();
        const filename = 'product_' + Date.now() + ext;
        const blob = await put(filename, reqFile.buffer, { access: 'public' });
        return blob.url; // Returns full HTTPS URL
    } else {
        return reqFile.filename; // Returns local filename
    }
};

// Auth Middleware
const auth = (req, res, next) => {
    const token = req.cookies.admin_token || req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid Token' });
    }
};

// --- AUTH ROUTES ---
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const envEmail = process.env.ADMIN_EMAIL || 'admin@rksteelfurniture.com';
    const envPassword = process.env.ADMIN_PASSWORD || 'admin123';

    let user = await db.User.findOne({ where: { email } });

    // Allow override if credentials match env variables
    const matchesEnv = (email === envEmail && password === envPassword);

    if (!user && matchesEnv) {
        // Create user on the fly if it matches env and doesn't exist
        const hashedPassword = await bcrypt.hash(envPassword, 10);
        user = await db.User.create({ email: envEmail, password: hashedPassword });
    }

    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
         // Sync password to env if it matches env password
         if (matchesEnv) {
             const hashedPassword = await bcrypt.hash(envPassword, 10);
             await user.update({ password: hashedPassword });
         } else {
             return res.status(401).json({ error: 'Invalid credentials' });
         }
    }
    
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1d' });
    res.cookie('admin_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    res.json({ success: true, token });
});

router.post('/logout', (req, res) => {
    res.clearCookie('admin_token');
    res.json({ success: true });
});

router.get('/me', auth, async (req, res) => {
    const user = await db.User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
    res.json({ user });
});

// --- SETTINGS ROUTES ---
router.get('/settings', auth, async (req, res) => {
    const settings = await db.Settings.findAll();
    res.json(settings);
});
router.post('/settings', auth, async (req, res) => {
    const settingsArray = req.body;
    for (const setting of settingsArray) {
        await db.Settings.upsert(setting);
    }
    res.json({ success: true });
});

// --- PRODUCTS ROUTES ---
router.get('/products', auth, async (req, res) => {
    try {
        const products = await db.Product.findAll({ order: [['order', 'ASC']] });
        res.json(products);
    } catch (err) {
        console.error('GET /products error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Create product WITHOUT image (JSON body)
router.post('/products', auth, async (req, res) => {
    try {
        const product = await db.Product.create(req.body);
        res.json(product);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Create product WITH image upload (multipart/form-data)
router.post('/products/with-image', auth, upload.single('productImage'), async (req, res) => {
    try {
        const fields = { ...req.body };
        // Parse featured / status booleans from form strings
        if (fields.featured === 'true') fields.featured = true;
        if (fields.featured === 'false') fields.featured = false;
        // Parse specs JSON string
        if (fields.specs) {
            try { fields.specs = JSON.stringify(JSON.parse(fields.specs)); } catch { fields.specs = null; }
        }
        // Set image if file was uploaded
        if (req.file) {
            fields.image = await processImageUpload(req.file);
        }
        const product = await db.Product.create(fields);
        res.json(product);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update product WITH optional image upload
router.put('/products/:id/with-image', auth, upload.single('productImage'), async (req, res) => {
    try {
        const fields = { ...req.body };
        if (fields.featured === 'true') fields.featured = true;
        if (fields.featured === 'false') fields.featured = false;
        if (fields.specs) {
            try { fields.specs = JSON.stringify(JSON.parse(fields.specs)); } catch { fields.specs = null; }
        }
        if (req.file) {
            fields.image = await processImageUpload(req.file);
        }
        await db.Product.update(fields, { where: { id: req.params.id } });
        const updated = await db.Product.findByPk(req.params.id);
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.put('/products/:id', auth, async (req, res) => {
    try {
        await db.Product.update(req.body, { where: { id: req.params.id } });
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});
router.delete('/products/:id', auth, async (req, res) => {
    try {
        await db.Product.destroy({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- SECTIONS ROUTES ---
router.get('/sections', auth, async (req, res) => {
    try {
        const sections = await db.Section.findAll({ order: [['order', 'ASC']] });
        res.json(sections);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.put('/sections/:id', auth, async (req, res) => {
    try {
        await db.Section.update(req.body, { where: { id: req.params.id } });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- MEDIA ROUTES ---
router.get('/media', auth, async (req, res) => {
    const media = await db.Media.findAll({ order: [['createdAt', 'DESC']] });
    res.json(media);
});
router.post('/media', auth, upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const mediaPath = process.env.BLOB_READ_WRITE_TOKEN ? (await processImageUpload(req.file)) : `/assets/${req.file.filename}`;
    const media = await db.Media.create({
        filename: process.env.BLOB_READ_WRITE_TOKEN ? req.file.originalname : req.file.filename,
        path: mediaPath,
        mimetype: req.file.mimetype,
        size: req.file.size
    });
    res.json(media);
});
router.delete('/media/:id', auth, async (req, res) => {
    await db.Media.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
});

// Dashboard Stats
router.get('/stats', auth, async (req, res) => {
    try {
        const totalProducts = await db.Product.count();
        const publishedProducts = await db.Product.count({ where: { status: 'published' } });
        const totalMedia = await db.Media.count();
        res.json({ totalProducts, publishedProducts, totalMedia });
    } catch (err) {
        console.error('GET /stats error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
