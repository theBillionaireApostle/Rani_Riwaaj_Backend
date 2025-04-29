// routes/productRoutes.js

const express   = require('express');
const router    = express.Router();
const dbConnect = require('../config/db');
const Product   = require('../models/Product');
const Category  = require('../models/Category');  // adjust the path if needed

/**
 * GET /api/products?category=<slug>
 * - Without ?category returns all products
 * - With ?category=slug returns only products in that category
 */
router.get('/', async (req, res) => {
  try {
    await dbConnect();

    const { category: categorySlug } = req.query;
    const filter = {};

    if (categorySlug) {
      // Look up the category document by slug
      const categoryDoc = await Category.findOne({ slug: categorySlug });
      if (!categoryDoc) {
        // If no such category, return an empty array
        return res.json([]);
      }
      // Filter products by the category's ObjectId
      filter.category = categoryDoc._id;
    }

    // Fetch products (populate if you want full category data)
    const products = await Product.find(filter);
    return res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return res
      .status(500)
      .json({ error: error.message || "Failed to fetch products" });
  }
});

/**
 * POST /api/products
 * Create a new product
 */
router.post('/', async (req, res) => {
  try {
    await dbConnect();
    const data = req.body;
    const product = new Product(data);
    await product.save();
    return res.status(201).json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    return res
      .status(500)
      .json({ error: error.message || "Failed to create product" });
  }
});

router.get('/published', async (req, res) => {
  try {
    await dbConnect();
    const products = await Product.find({ published: true });
    return res.json(products);
  } catch (err) {
    console.error("Error fetching published products:", err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/products/:id
 * Fetch a single product by ID
 */
router.get('/:id', async (req, res) => {
  try {
    await dbConnect();
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    return res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return res
      .status(500)
      .json({ error: error.message || "Failed to fetch product" });
  }
});

/**
 * PUT /api/products/:id
 * Update a product by ID
 */
router.put('/:id', async (req, res) => {
  try {
    await dbConnect();
    const { id } = req.params;
    const data = req.body;
    const product = await Product.findByIdAndUpdate(id, data, { new: true });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    return res.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    return res
      .status(500)
      .json({ error: error.message || "Failed to update product" });
  }
});

/**
 * DELETE /api/products/:id
 * Delete a product by ID
 */
router.delete('/:id', async (req, res) => {
  try {
    await dbConnect();
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    return res.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return res
      .status(500)
      .json({ error: error.message || "Failed to delete product" });
  }
});

/**
 * PATCH /api/products/:id/published
 * Toggle the published status of a product
 */
router.patch('/:id/published', async (req, res) => {
  try {
    await dbConnect();
    const { id } = req.params;
    const { published } = req.body;
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { published },
      { new: true }
    );
    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }
    return res.json(updatedProduct);
  } catch (error) {
    console.error("Error toggling product published status:", error);
    return res
      .status(500)
      .json({ error: error.message || "Failed to toggle product status" });
  }
});

module.exports = router;
