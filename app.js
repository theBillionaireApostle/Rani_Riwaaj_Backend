// app.js

const express        = require('express');
const cookieParser   = require('cookie-parser');
const cors           = require('cors');

// Route modules
const productRoutes       = require('./routes/productRoutes');
const productImageRoutes  = require('./routes/productImageRoutes');
const cartRoutes          = require('./routes/cartRoutes');
const userRoutes          = require('./routes/userRoutes');
const adminRoutes         = require('./routes/adminRoutes');
const categoryRoutes      = require('./routes/categoryRoutes');
const { logPageView }     = require("./middlewares/logger");
const eventRoutes         = require("./routes/events");
const analyticsRoutes     = require("./routes/analytics");



const app = express();

// === CORS ===
// Allow your React front‑end at localhost:3000 to interact with this API
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,            // allow cookies
  })
);

// === Built‑in middleware ===
app.use(express.json({ limit: '5mb' }));  // support up to 5MB base64 payloads
app.use(cookieParser());

// === Mount image‑upload endpoint ===
// This handles POST /api/images/upload (base64 → Cloudinary)
app.use('/api/images', productImageRoutes);

// === Mount category endpoints ===
// Public: GET /api/categories
// Admin: POST /api/categories, PATCH /api/categories/:id, DELETE /api/categories/:id
app.use('/api/categories', categoryRoutes);

// === Mount product endpoints ===
// CRUD on products under /api/products
app.use('/api/products', productRoutes);

// === Mount cart endpoints ===
app.use('/api/cart', cartRoutes);

// === Mount user endpoints ===
app.use('/api/users', userRoutes);

app.use(logPageView);

app.use("/api/events", eventRoutes);

app.use("/api/analytics", analyticsRoutes);

// === Mount admin‑only endpoints (e.g. login) ===
app.use('/admin', adminRoutes);

// === Health check ===
app.get('/', (req, res) => {
  res.send('🎉 API is up and running!');
});

// === Global error handler (optional) ===
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ error: 'Something went wrong' });
// });

module.exports = app;