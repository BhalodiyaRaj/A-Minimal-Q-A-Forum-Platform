const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME || "dtgh7jqxp",
  api_key: process.env.CLOUDINARY_API_KEY || "897655428869549",
  api_secret: process.env.CLOUDINARY_SECRET_KEY || "CA1OWzzGFPK88kWsgJW7GKzZ4tY"
});

// Upload image to Cloudinary
const uploadImage = async (file, folder = 'avatars') => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: folder,
      width: 300,
      height: 300,
      crop: 'fill',
      gravity: 'face',
      quality: 'auto',
      format: 'jpg'
    });
    
    return {
      success: true,
      url: result.secure_url,
      public_id: result.public_id
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Delete image from Cloudinary
const deleteImage = async (public_id) => {
  try {
    const result = await cloudinary.uploader.destroy(public_id);
    return {
      success: true,
      result
    };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  uploadImage,
  deleteImage
}; 