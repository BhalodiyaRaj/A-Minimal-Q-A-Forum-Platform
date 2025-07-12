const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME || "dtgh7jqxp",
  api_key: process.env.CLOUDINARY_API_KEY || "897655428869549",
  api_secret: process.env.CLOUDINARY_SECRET_KEY || "CA1OWzzGFPK88kWsgJW7GKzZ4tY"
});

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [
      { width: 300, height: 300, crop: 'fill', gravity: 'face' },
      { quality: 'auto', fetch_format: 'auto' }
    ]
  }
});

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Middleware for single avatar upload
const uploadAvatar = upload.single('avatar');

// Error handling middleware for multer
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        status: 'error',
        message: 'File size too large. Maximum size is 5MB.'
      });
    }
  } else if (err) {
    return res.status(400).json({
      status: 'error',
      message: err.message
    });
  }
  next();
};

module.exports = {
  uploadAvatar,
  handleUploadError
}; 