const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    // Ensure you have an "uploads" folder in your project root (or adjust the path)
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    // Use a unique filename (for example, by prefixing Date.now())
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// Optionally, add fileFilter to allow only images.
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = allowedTypes.test(file.mimetype);
  if (extName && mimeType) {
    return cb(null, true);
  } else {
    cb(new Error('Only images are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 } // Limit file size to 5 MB
});

module.exports = upload;
