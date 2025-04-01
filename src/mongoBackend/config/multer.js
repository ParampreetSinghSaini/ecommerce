const multer = require('multer');
const path = require('path');

// Define the storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'public/productImg/';
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
}); 

// Define file filter to allow only specific file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Only jpeg, png, jpg files are allowed'), false);
  }
  cb(null, true);
};

// Create and export the upload middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

module.exports = upload;
