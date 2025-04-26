// config/cloudinary.js
const cloudinary = require('cloudinary').v2;

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  throw new Error("Please define CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment");
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Uploads an image to Cloudinary.
 *
 * @param {string|Buffer} filePathOrBuffer A string (data URI) or Buffer containing image data.
 * @param {object} [options={}] Optional upload options.
 * @returns {Promise<object>} A promise resolving with the Cloudinary upload response.
 */
async function uploadImage(filePathOrBuffer, options = {}) {
  const dataUri = typeof filePathOrBuffer === "string"
    ? filePathOrBuffer
    : `data:image/webp;base64,${filePathOrBuffer.toString('base64')}`;

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      dataUri,
      { folder: "house_of_phulkari", ...options },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
  });
}

/**
 * Deletes an image from Cloudinary by its public ID.
 *
 * @param {string} publicId The public ID of the image to delete.
 * @returns {Promise<object>} A promise resolving with the Cloudinary deletion response.
 */
async function deleteImage(publicId) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
  });
}

module.exports = {
  cloudinary,
  uploadImage,
  deleteImage,
};
