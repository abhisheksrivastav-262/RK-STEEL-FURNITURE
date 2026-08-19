const express = require('express');
const router = express.Router();
const db = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

const JWT_SECRET = process.env.JWT_SECRET || 'rk_steel_super_secret_key_123';

// Multer setup for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, 'public/assets'); },
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
    const user = await db.User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });
    
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
            fields.image = req.file.filename;
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
            fields.image = req.file.filename;
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
    const media = await db.Media.create({
        filename: req.file.filename,
        path: `/assets/${req.file.filename}`,
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
