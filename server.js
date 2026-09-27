const express = require('express');
const path = require('path');
const db = require('./db');
require('dotenv').config();

const app = express();

// -------------------------------------------------------------
// Middleware Pipeline
// -------------------------------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// -------------------------------------------------------------
// REST API Routes
// -------------------------------------------------------------

/**
 * @route   GET /api/products
 * @desc    Fetch all available boutique products
 */
app.get('/api/products', async (req, res, next) => {
    try {
        const [products] = await db.execute(`
            SELECT p.id, p.title, p.description, p.price, p.image_url, p.fit_type, p.recommended_shape, c.name AS category 
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            ORDER BY p.id DESC
        `);

        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/smart-match
 * @desc    Algorithmic style recommendation based on user body metrics
 */
app.post('/api/smart-match', async (req, res, next) => {
    try {
        const { bodyShape, preferredStyle } = req.body;

        if (!bodyShape) {
            return res.status(400).json({
                success: false,
                message: 'Body shape parameter is required for virtual fit engine.'
            });
        }

        const sqlQuery = `
            SELECT id, title, description, price, image_url, fit_type, recommended_shape 
            FROM products 
            WHERE recommended_shape = ? OR description LIKE ?
        `;

        const styleKeyword = preferredStyle ? `%${preferredStyle}%` : '%';
        const [recommendations] = await db.execute(sqlQuery, [bodyShape, styleKeyword]);

        res.status(200).json({
            success: true,
            matchCount: recommendations.length,
            data: recommendations
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/appointments
 * @desc    Book a custom fitting or bespoke tailoring appointment
 */
app.post('/api/appointments', async (req, res, next) => {
    try {
        const { userId, appointmentDate, serviceType } = req.body;

        if (!appointmentDate || !serviceType) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: appointmentDate and serviceType are required.'
            });
        }

        const defaultUserId = userId || 1;

        const insertQuery = `
            INSERT INTO appointments (user_id, appointment_date, service_type, status)
            VALUES (?, ?, ?, 'Pending')
        `;

        const [result] = await db.execute(insertQuery, [defaultUserId, appointmentDate, serviceType]);

        res.status(201).json({
            success: true,
            message: 'Bespoke fitting appointment scheduled successfully.',
            appointmentId: result.insertId
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/appointments/bespoke
 * @desc    Transaction-safe booking that registers guest details & schedules fitting
 */
app.post('/api/appointments/bespoke', async (req, res, next) => {
    const connection = await db.getConnection();

    try {
        const { fullName, email, bodyShape, appointmentDate, serviceType } = req.body;

        if (!fullName || !email || !appointmentDate || !serviceType) {
            return res.status(400).json({
                success: false,
                message: 'All fields (fullName, email, appointmentDate, serviceType) are required.'
            });
        }

        await connection.beginTransaction();

        const [existingUsers] = await connection.execute(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        let userId;

        if (existingUsers.length > 0) {
            userId = existingUsers[0].id;
        } else {
            const [newUser] = await connection.execute(
                `INSERT INTO users (full_name, email, password_hash, body_shape) 
                 VALUES (?, ?, 'GUEST_ACCOUNT_HASH', ?)`,
                [fullName, email, bodyShape || 'Rectangle']
            );
            userId = newUser.insertId;
        }

        const [appointmentResult] = await connection.execute(
            `INSERT INTO appointments (user_id, appointment_date, service_type, status) 
             VALUES (?, ?, ?, 'Pending')`,
            [userId, appointmentDate, serviceType]
        );

        await connection.commit();

        res.status(201).json({
            success: true,
            message: 'Bespoke appointment & client profile successfully registered!',
            data: {
                userId,
                appointmentId: appointmentResult.insertId,
                status: 'Pending'
            }
        });

    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
});

// -------------------------------------------------------------
// Analytics & Event Tracking Routes
// -------------------------------------------------------------

/**
 * @route   POST /api/analytics/log
 * @desc    Collect user interactions from webpage and insert into analytics_events table
 */
app.post('/api/analytics/log', async (req, res, next) => {
    try {
        const { eventType, bodyShape, preferredStyle, productId } = req.body;

        const insertQuery = `
            INSERT INTO analytics_events (event_type, body_shape, preferred_style, product_id)
            VALUES (?, ?, ?, ?)
        `;

        const [result] = await db.execute(insertQuery, [
            eventType,
            bodyShape || null,
            preferredStyle || null,
            productId || null
        ]);

        res.status(201).json({
            success: true,
            message: 'Interaction logged directly to MySQL database.',
            insertedId: result.insertId
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/analytics/dashboard
 * @desc    Aggregate business analytics and customer trend metrics
 */
app.get('/api/analytics/dashboard', async (req, res, next) => {
    try {
        const [bodyShapeStats] = await db.execute(`
            SELECT body_shape, COUNT(*) AS total_searches 
            FROM analytics_events 
            WHERE event_type = 'SEARCH_FIT' AND body_shape IS NOT NULL
            GROUP BY body_shape 
            ORDER BY total_searches DESC
        `);

        const [appointmentStats] = await db.execute(`
            SELECT service_type, COUNT(*) AS total_bookings
            FROM appointments
            GROUP BY service_type
        `);

        const [productFitDistribution] = await db.execute(`
            SELECT recommended_shape, COUNT(*) AS item_count
            FROM products
            GROUP BY recommended_shape
        `);

        res.status(200).json({
            success: true,
            analytics: {
                topSearchedBodyShapes: bodyShapeStats,
                appointmentBreakdown: appointmentStats,
                catalogFitDistribution: productFitDistribution
            }
        });
    } catch (error) {
        next(error);
    }
});

// -------------------------------------------------------------
// Centralized Error Handling Middleware
// -------------------------------------------------------------
app.use((err, req, res, next) => {
    console.error(`[Server Error]: ${err.stack}`);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal Server Error'
    });
});

// -------------------------------------------------------------
// Server Initialization
// -------------------------------------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Boutique Core API running in development mode on http://localhost:${PORT}`);
});