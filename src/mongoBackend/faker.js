const mongoose = require('mongoose');
const { Product } = require('./models/Products');
const Category  = require('./models/categorySchema');
// const { Category } = require('./models/categorySchema');
const { faker } = require('@faker-js/faker');
const { url } = require('./config/db');
const ProductVariant = require('./models/productVariantSchema'); 
const Option = require('./models/optionSchema');
const OptionValue = require('./models/optionValueSchema ');
const ProductOption = require('./models/productOptionSchema ');
const VariantOption = require('./models/variantOptionSchema');

require('dotenv').config(); 

// Database connection
const connectDB = async () => {
    try {
        await mongoose.connect(`${url}`, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Database connected');
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
};

// Generate a fake category
const generateFakeCategory = async () => {
    const category = new Category({
        name: faker.commerce.department(),
        description: faker.lorem.sentence(),
    });
    await category.save();
    return category._id;
};



const generateFakeProduct = async (categoryId, index) => {
    // Determine the image based on the index (ladies: 1-12, gents: 13-36)
    let imageIndex = index + 1; // Because array index starts at 0, but filenames start at 1
    let imageName;

    if (imageIndex <= 12) {
        // For ladies products (1-12)
        imageName = `product_${imageIndex}.png`;
    } else {
        // For gents products (13-36)
        imageName = `product_${imageIndex}.png`;
    }

    const imageUrl = `${process.env.IMAGE_BASE_URL}/images/${imageName}`; // Construct the image URL

    const product = new Product({
        name: faker.commerce.productName(),
        image: imageUrl, // The image path from the generated URL
        description: faker.commerce.productDescription(),
        price: faker.number.float({ min: 10, max: 1000, precision: 0.01 }),
        additional_description: faker.lorem.paragraph(),
        additional_info: faker.lorem.sentences(3),
        shipping_return: faker.lorem.sentences(2),
        meta_title: faker.lorem.sentence(5),
        meta_desc: faker.lorem.sentence(),
        is_active: faker.datatype.boolean(),
        category_id: categoryId, // Use the actual MongoDB ObjectId
        tags: Array.from({ length: 3 }, () => faker.commerce.productAdjective()),
        continue_selling_when_out_of_stock: faker.datatype.boolean(),
    });

    // Save the product to get its ID
    await product.save();

    // Create product variant
    const productVariant = new ProductVariant({
        product_id: product._id, // Reference the saved product's ID
        sku: faker.string.uuid(),
        price: faker.number.float({ min: 5, max: 500, precision: 0.01 }),
        stock: faker.number.int({ min: 0, max: 100 }),
    });

    // Save the product variant first to get its ID
    await productVariant.save();

    // Generate fake options and option values
    const optionNames = ['Color']; // Example options

    for (let optionName of optionNames) {
        // Create Option
        const option = new Option({
            name: optionName,
        });

        // Save the option to get its ID
        await option.save();

        // Create fake option values for this option
        const optionValues = [];
        if (optionName === 'Color') {
            optionValues.push('Red');
        } else if (optionName === 'Size') {
            optionValues.push('Small');
        } else if (optionName === 'Material') {
            optionValues.push('Cotton');
        }

        for (let value of optionValues) {
            // Create OptionValue
            const optionValue = new OptionValue({
                option_id: option._id,
                value,
            });

            // Save OptionValue
            await optionValue.save();

            // Create VariantOption for the product variant
            const variantOption = new VariantOption({
                variant_id: productVariant._id, // Reference the saved product variant's ID
                option_value_id: optionValue._id, // Reference the saved option value's ID
            });

            // Save VariantOption
            await variantOption.save();
        }
    }

    // Return the product with the variant
    return product;
};

// Generate and save multiple products
const generateAndSaveProducts = async (count) => {
    try {
        await connectDB();

        // Create a fake category to associate with products
        const categoryId = await generateFakeCategory();

        const promises = [];
        for (let i = 0; i < count; i++) {
            promises.push(generateFakeProduct(categoryId, i)); // Pass the index for image assignment
        }

        const products = await Promise.all(promises);
        console.log(`${products.length} products saved successfully.`);
        process.exit(0); // Exit the process after saving
    } catch (error) {
        console.error('Error generating or saving products:', error);
        process.exit(1);
    }
};

// Call the function to save 36 fake products
generateAndSaveProducts(36);
