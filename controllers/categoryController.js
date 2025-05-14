// controllers/categoryController.js
const Category = require('../models/Category');
const { uploadImage, deleteImage } = require('../config/cloudinary');

/* ------------------------------------------------------------------ */
/*  Utility                                                            */
/* ------------------------------------------------------------------ */

/**
 * Uploads an image either from a multipart buffer (req.file.buffer)
 * or from a Base64 string (req.body.imageBase64).
 * @param {string}  imageBase64 – base64 string (without the data URI prefix)
 * @param {Buffer}  fileBuffer  – buffer from multer
 * @param {string}  folder      – Cloudinary folder name
 * @returns {Promise<{ secure_url: string, public_id: string }>}
 */
async function handleUpload(imageBase64, fileBuffer, folder = 'categories') {
  if (fileBuffer) {
    return await uploadImage(fileBuffer, { folder });
  }
  if (imageBase64) {
    const buffer = Buffer.from(imageBase64, 'base64');
    return await uploadImage(buffer, { folder });
  }
  throw new Error('No image data provided');
}

/* ------------------------------------------------------------------ */
/*  PUBLIC ENDPOINTS                                                   */
/* ------------------------------------------------------------------ */

// GET /api/categories
exports.listCategories = async (_req, res) => {
  try {
    const cats = await Category.find().sort('name');
    res.json(cats);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// GET /api/categories/:id
exports.getCategory = async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).send('Category not found');
    res.json(cat);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

/* ------------------------------------------------------------------ */
/*  ADMIN-ONLY ENDPOINTS                                               */
/* ------------------------------------------------------------------ */

// POST /api/categories
exports.createCategory = async (req, res) => {
  try {
    const { name, slug, description, imageBase64, folder } = req.body;
    if (!req.file && !imageBase64) {
      return res.status(400).send('Image file or base64 data is required');
    }

    // upload
    const result = await handleUpload(imageBase64, req.file?.buffer, folder);

    // create doc
    const cat = await Category.create({
      name,
      slug,
      description,
      image: { url: result.secure_url, publicId: result.public_id },
    });

    res.status(201).json(cat);
  } catch (err) {
    console.error(err);
    if (err.code === 11000)
      return res.status(409).send('Slug or name already exists');
    res.status(500).send('Failed to create category');
  }
};

// PATCH /api/categories/:id
exports.updateCategory = async (req, res) => {
  try {
    const { imageBase64, folder } = req.body;
    const updates = { ...req.body };
    delete updates.imageBase64;
    delete updates.folder;

    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).send('Category not found');

    // replace image if provided
    if (req.file || imageBase64) {
      await deleteImage(cat.image.publicId);
      const result = await handleUpload(imageBase64, req.file?.buffer, folder);
      updates.image = { url: result.secure_url, publicId: result.public_id };
    }

    const updated = await Category.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to update category');
  }
};

// DELETE /api/categories/:id
exports.deleteCategory = async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).send('Category not found');

    await deleteImage(cat.image.publicId); // remove from Cloudinary
    await cat.remove(); // remove from MongoDB

    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to delete category');
  }
};
