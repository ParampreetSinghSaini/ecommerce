
const express = require('express');
const router = express.Router();
const productController = require('../controller/productController');
const upload = require('../config/multer');
const multer = require('multer');

const multerErrorHandler = (err, req, res, next) => {
    if (err instanceof multer.MulterError || err instanceof Error) {
      console.error('Multer Error:', err.message); // Log error to console
      return res.status(400).json({ error: 'File upload failed. ' + err.message });
    }
    next(err); // Pass to the next middleware if not a multer error
  };


router.post('/',upload.single('image'),multerErrorHandler, productController.addProduct);
router.get('/', productController.getProducts);
router.get('/tags', productController.getTags);
router.get('/:productId', productController.getProductsById);
router.put('/:productId',upload.single('image'), productController.editProduct);
router.delete('/:productId', productController.deleteProduct);

module.exports = router;
