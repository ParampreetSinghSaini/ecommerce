// routes/categoryRoutes.js

const express = require('express');
const router = express.Router();
const categoryController = require('../controller/categoryController'); // Ensure the correct path here

// Define the routes
router.post('/', categoryController.addCategory);      // Add category
router.get('/', categoryController.getCategory);      // Get all categories
router.get('/:categoryId', categoryController.getCategoryById);  // Get category by ID
router.put('/:categoryId', categoryController.editCategory);  // Edit category
router.delete('/:categoryId', categoryController.deleteCategory);  // Delete category

module.exports = router;
