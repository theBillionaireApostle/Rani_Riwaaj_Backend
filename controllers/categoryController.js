// controllers/categoryController.js
const Category = require('../models/Category');
const { uploadImage, deleteImage } = require('../config/cloudinary');

// Helper to upload via buffer or base64
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

// Public: list all categories
exports.listCategories = async (req, res) => {
  try {
    const cats = await Category.find().sort('name');
    res.json(cats);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// Admin: create a category
// Accepts either multipart file under `req.file` or base64 in `req.body.imageBase64`
exports.createCategory = async (req, res) => {
  try {
    const { name, slug, description, imageBase64, folder } = req.body;
    if (!req.file && !imageBase64) {
      return res.status(400).send('Image file or base64 data is required');
    }

    // Upload image
    const result = await handleUpload(imageBase64, req.file?.buffer, folder);

    // Create category
    const cat = await Category.create({
      name,
      slug,
      description,
      image: {
        url: result.secure_url,
        publicId: result.public_id,
      },
    });

    res.status(201).json(cat);
  } catch (err) {
    console.error(err);
    if (err.code === 11000) return res.status(409).send('Slug or name already exists');
    res.status(500).send('Failed to create category');
  }
};

// Admin: update a category
// Can replace image via multipart or base64
exports.updateCategory = async (req, res) => {
  try {
    const { imageBase64, folder } = req.body;
    const updates = { ...req.body };
    delete updates.imageBase64;
    delete updates.folder;

    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).send('Category not found');

    // If image provided, delete old and upload new
    if (req.file || imageBase64) {
      await deleteImage(cat.image.publicId);
      const result = await handleUpload(imageBase64, req.file?.buffer, folder);
      updates.image = { url: result.secure_url, publicId: result.public_id };
    }

    const updated = await Category.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to update category');
  }
};

// Admin: delete a category (and its Cloudinary image)
exports.deleteCategory = async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).send('Category not found');

    // Delete Cloudinary image
    await deleteImage(cat.image.publicId);
    await cat.remove();

    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to delete category');
  }
};
