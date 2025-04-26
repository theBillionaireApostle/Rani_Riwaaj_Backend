// routes/categoryRoutes.js
const express = require('express');
const multer  = require('multer');
const {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { requireAuth, requireAdmin } = require('../middlewares/auth');   // <-- add requireAuth

const router = express.Router();
const upload = multer(); // in‑memory storage

/* ------------------------------------------------------------------ */
/*  PUBLIC                                                            */
/* ------------------------------------------------------------------ */
router.get('/', listCategories);

/* ------------------------------------------------------------------ */
/*  ADMIN‑ONLY                                                        */
/* ------------------------------------------------------------------ */
router.post(
  '/',
  requireAuth,            // ① verify JWT, attach req.user
  requireAdmin,           // ② be sure the user is an admin
  upload.single('image'),
  createCategory
);

router.patch(
  '/:id',
  requireAuth,
  requireAdmin,
  upload.single('image'),
  updateCategory
);

router.delete(
  '/:id',
  requireAuth,
  requireAdmin,
  deleteCategory
);

module.exports = router;