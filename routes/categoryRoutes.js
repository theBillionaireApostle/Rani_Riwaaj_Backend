// routes/categoryRoutes.js
const express = require('express');
const multer  = require('multer');
const {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { requireAuth, requireAdmin } = require('../middlewares/auth');

const router = express.Router();
const upload = multer(); // in-memory storage

/* ------------------------------------------------------------------ */
/*  PUBLIC ROUTES                                                     */
/* ------------------------------------------------------------------ */
router.get('/',     listCategories); // list all
router.get('/:id',  getCategory);    // get one by ID

/* ------------------------------------------------------------------ */
/*  ADMIN ROUTES (JWT + role check)                                   */
/* ------------------------------------------------------------------ */
router.post(
  '/',
  requireAuth,
  requireAdmin,
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
