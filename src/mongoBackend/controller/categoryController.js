// controller/categoryController.js

const Category = require('../models/categorySchema'); // Assuming you have a Category model


// Add a new category
exports.addCategory = async (req, res) => {
    const { name, description } = req.body;

    try {
        // Check if the category already exists
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({ error: 'Category with this name already exists' });
        }

        // If not, create the new category
        const category = new Category({ name, description });
        await category.save();
        res.status(201).json(category);
    } catch (error) {
        console.error("Error adding category:", error);
        res.status(500).json({ error: 'Failed to add category' });
    }
};

exports.getCategory = async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get categories' });
    }
};


// Get all categories
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        return res.status(200).json(categories);
    } catch (error) {
        console.error('Error getting categories:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// Get a category by its ID
exports.getCategoryById = async (req, res) => {
    const { categoryId } = req.params;
    
    try {
        const category = await Category.findById(categoryId);
        
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }
        
        return res.status(200).json(category);
    } catch (error) {
        console.error('Error getting category by ID:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// Edit a category by its ID
exports.editCategory = async (req, res) => {
    const { categoryId } = req.params;
    const { name, description } = req.body;
    
    try {
        const category = await Category.findByIdAndUpdate(
            categoryId, 
            { name, description }, 
            { new: true }
        );
        
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }
        
        return res.status(200).json({ message: 'Category updated successfully', category });
    } catch (error) {
        console.error('Error updating category:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// Delete a category by its ID
exports.deleteCategory = async (req, res) => {
    const { categoryId } = req.params;
    
    try {
        const category = await Category.findByIdAndDelete(categoryId);
        
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }
        
        return res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
