const Option = require('../models/optionSchema');
const OptionValue = require('../models/optionValueSchema ');
const ProductOption = require('../models/productOptionSchema ');
const Tag = require('../models/tagsSchema'); 
const { Product, Category } = require('../models/Products');
const ProductVariant = require('../models/productVariantSchema');
const VariantOption = require('../models/variantOptionSchema');
const path = require('path');
const fs = require('fs');


exports.addProduct = async (req, res) => {
   
    let parsedCategoryId = JSON.parse(req.body.category_id);


    const {
        name,
        description,
        price,
        additional_description,
        additional_info,
        shipping_return,
        meta_title,
        meta_desc,
        is_active,
    
        tags,
        continue_selling_when_out_of_stock,
        variants
    } = req.body;


    let parsedVariants = [];
    try {
        parsedVariants = Array.isArray(variants) ? variants : JSON.parse(variants || '[]');
    } catch (error) {
        console.error("Error parsing variants:", error);
    }


    // console.log(req.file);

    try {
        const existingProduct = await Product.findOne({ name });
        if (existingProduct) {
        
            if (req.file?.filename) {
                
                const oldImagePath = path.join(__dirname, '../public/productImg', req.file.filename);
                // console.log(oldImagePath);
                fs.unlink(oldImagePath, (err) => {
                    if (err) {
                        console.error(`Error deleting old image: ${err.message}`);
                    } else {
                        console.log(`Deleted old image: ${oldImagePath}`);
                    }
                });
            }
            return res.status(400).json({ error: 'Product with this name already exists.' });
        }

        if (isNaN(price) || price <= 0) {
            return res.status(400).json({ error: 'Invalid price. Price should be a positive number.' });
        }
        // console.log(req.file, "dsfdsfds")
        // const image = req.file ? `http://localhost:3001/images/${req.file.filename}` : "";
        const image = req.file ? `${process.env.IMAGE_BASE_URL}/images/${req.file.filename}` : "";
        let tagIds = [];
        if (tags && tags.length > 0) {
            const tagNames = JSON.parse(tags); // Ensure tags are parsed if sent as a string

            for (const tagName of tagNames) {
                let tag = await Tag.findOne({ name: tagName });

                if (!tag) {
                    tag = new Tag({ name: tagName });
                    await tag.save();
                }

                tagIds.push(tag._id);
            }
        }


        try {
            const product = new Product({
                name,
                image, // The image path from multer
                description,
                price: parseFloat(price),
                additional_description,
                additional_info,
                shipping_return,
                meta_title,
                meta_desc,
                is_active,
                category_id: parsedCategoryId,
                  tags: tagIds, 
                continue_selling_when_out_of_stock,
            });

            await product.save();

            if (parsedVariants && parsedVariants.length > 0) {
                for (const variant of parsedVariants) {
                    const { sku, price: variantPrice, stock, options } = variant;

                    // Validate variant price
                    if (isNaN(variantPrice) || variantPrice <= 0) {
                        return res.status(400).json({ error: `Invalid variant price for SKU: ${sku}. Price should be a positive number.` });
                    }

                    const productVariant = new ProductVariant({
                        product_id: product._id,
                        sku,
                        price: parseFloat(variantPrice),
                        stock,
                    });

                    await productVariant.save();

                    for (const option of options) {
                        const { optionName, optionValues } = option;

                        let optionDoc = await Option.findOne({ name: optionName });
                        if (!optionDoc) {
                            optionDoc = new Option({ name: optionName });
                            await optionDoc.save();
                        }

                        const existingProductOption = await ProductOption.findOne({
                            product_id: product._id,
                            option_id: optionDoc._id,
                        });

                        if (!existingProductOption) {
                            const productOption = new ProductOption({
                                product_id: product._id,
                                option_id: optionDoc._id,
                            });
                            await productOption.save();
                        }

                        for (const value of optionValues) {
                            let optionValueDoc = await OptionValue.findOne({
                                option_id: optionDoc._id,
                                value,
                            });

                            if (!optionValueDoc) {
                                optionValueDoc = new OptionValue({
                                    option_id: optionDoc._id,
                                    value,
                                });
                                await optionValueDoc.save();
                            }

                            const variantOption = new VariantOption({
                                variant_id: productVariant._id,
                                option_value_id: optionValueDoc._id,
                            });
                            await variantOption.save();
                        }
                    }
                }
            }

            // Send response after all operations are complete
            return res.status(201).json({ message: 'Product added successfully.', product });

        } catch (error) {
            console.error('Error adding product:', error);
            return res.status(500).json({ error: 'Internal server error.' });
        }
    } 
    catch (error) {
        console.error('Error processing product data:', error);
        return res.status(500).json({ error: error?.response?.message || 'Internal server error.' });
    }
};



exports.getProducts = async (req, res) => {
    try {
        const { category } = req.query;

        // Fetch all products and populate category and tags fields
        const products = await Product.find()
            .populate('category_id', 'name')
            .populate('tags');

        if (!products) {
            return res.status(404).json({ error: 'No products found.' });
        }

        // Filter products by category name if provided
        const filteredProducts = category
            ? products.filter(product =>
                product.category_id && product.category_id.some(cat => cat.name === category)
            )
            : products;

        const populatedProducts = [];

        for (const product of filteredProducts) {
            // Map the array of categories to get their names; default to 'Uncategorized' if empty.
            const categoryNames = product.category_id && product.category_id.length 
                ? product.category_id.map(cat => cat.name)
                : ['Uncategorized'];

            const variants = await ProductVariant.find({ product_id: product._id })
                .populate('product_id', 'name')
                .exec();


                const tagNames = product.tags ? product.tags.map(tag => tag.name) : [];


            const variantDetails = [];
            for (const variant of variants) {
                const variantOptions = await VariantOption.find({ variant_id: variant._id })
                    .populate({
                        path: 'option_value_id',
                        model: 'OptionValue',
                        populate: {
                            path: 'option_id',
                            model: 'Option',
                            select: 'name',
                        },
                    })
                    .exec();

                variantDetails.push({
                    sku: variant.sku,
                    price: variant.price,
                    stock: variant.stock,
                    options: variantOptions.map(option => ({
                        option_name: option.option_value_id.option_id.name,
                        option_value: option.option_value_id.value,
                    })),
                });
            }
            populatedProducts.push({
                _id: product._id,
                name: product.name,
                image: product.image,
                description: product.description,
                price: product.price,
                categories: categoryNames, // Now returns an array of category names
                variants: variantDetails,
                tags: tagNames, 
                continue_selling_when_out_of_stock: product.continue_selling_when_out_of_stock,
                is_active: product.is_active,
            });
        }

        return res.status(200).json({ products: populatedProducts });
    } catch (error) {
        console.error('Error fetching products:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
};




exports.getProductsById = async (req, res) => {
    const productId = req.params.productId;

    try {
        // Fetch the product by ID and populate category and tags
        const product = await Product.findById(productId)
            .populate('category_id', 'name') // Populate category name
            .populate('tags'); // Populate tags if needed

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        // Fetch the variants related to the product ID and populate product_id
        const variants = await ProductVariant.find({ product_id: productId })
            .populate('product_id', 'name') // Populate product name
            .exec();


            const tagNames = product.tags ? product.tags.map(tag => tag.name) : [];
        // console.log(tagNames)
        // Step 2: For each variant, fetch its options and option values
        const variantDetails = [];

        for (const variant of variants) {
            // Fetch variant options from VariantOption collection
            const variantOptions = await VariantOption.find({ variant_id: variant._id })
                .populate({
                    path: 'option_value_id',
                    model: 'OptionValue',
                    populate: {
                        path: 'option_id',
                        model: 'Option',
                        select: 'name',
                    },
                })
                .exec();

            const options = variantOptions.map(option => ({
                option_name: option.option_value_id.option_id.name,
                option_value: option.option_value_id.value,
            }));

            variantDetails.push({
                id:variant.id,
                sku: variant.sku,
                price: variant.price,
                stock: variant.stock,
                options: options,
            });
        }


        const categories = product.category_id && product.category_id.length > 0 
        ? product.category_id.map(cat => cat.id) 
        : ['Uncategorized'];


        // Combine the product data with its variants and options
        const populatedProduct = {
            _id: product._id,
            name: product.name,
            image: product.image,
            description: product.description,
            price: product.price,
            additional_description: product.additional_description,
            additional_info: product.additional_info,
            shipping_return: product.shipping_return,
            meta_title: product.meta_title,
            meta_desc: product.meta_desc,
            is_active: product.is_active,
            is_deleted: product.is_deleted,
            // category: product.category_id ? product.category_id.name : 'Uncategorized',
            
            
            categories,


            tags: tagNames,
            continue_selling_when_out_of_stock: product.continue_selling_when_out_of_stock,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
            variants: variantDetails,
        };

        // Return the product with variants and options
        return res.status(200).json({ product: populatedProduct });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Failed to fetch data" });
    }
};



exports.editProduct = async (req, res) => {
    const { productId } = req.params;

    let parsedCategoryId = JSON.parse(req.body.category_id);

    const {
        name,
        description,
        price,
        additional_description,
        additional_info,
        shipping_return,
        meta_title,
        meta_desc,
        is_active,
        
        tags,
        continue_selling_when_out_of_stock,
        variants,
    } = req.body;

    try {
        // Step 1: Find the product
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found.' });
        }


        let updatedImage = product.image; // Default to the current image
        if (req.file) {
            // Construct new image URL
            updatedImage = `${process.env.IMAGE_BASE_URL}/images/${req.file.filename}`;

            // Delete old image if it exists
            if (product.image) {
                const oldImagePath = path.join(__dirname, '../public/productImg', product.image.replace(`${process.env.IMAGE_BASE_URL}/images`, ''));
                fs.unlink(oldImagePath, (err) => {
                    if (err) {
                        console.error(`Error deleting old image: ${err.message}`);
                    } else {
                        console.log(`Deleted old image: ${oldImagePath}`);
                    }
                });
            }
        }

       
        // Validate price
        if (isNaN(price) || price <= 0) {
            return res.status(400).json({ error: 'Invalid price, Must be a positive number.' });
        }

        // Parse and validate variants without modifying database
        let parsedVariants = [];
        try {
            parsedVariants = Array.isArray(variants) ? variants : JSON.parse(variants || '[]');
        } catch (error) {
            return res.status(400).json({ error: 'Invalid variants format.' });
        }

        const newVariants = [];
        for (const variant of parsedVariants) {
            const { sku, price: variantPrice, stock, options } = variant;

            // Validate variant fields
            if (!sku || isNaN(variantPrice) || variantPrice <= 0 || isNaN(stock) || stock < 0) {
                return res.status(400).json({ error: `Invalid data for variant: ${JSON.stringify(variant)}` });
            }

            const newOptions = [];
            if (options && Array.isArray(options)) {
                for (const option of options) {
                    const { optionName, optionValues } = option;

                    // Validate option values
                    if (!optionName || !Array.isArray(optionValues) || optionValues.length === 0) {
                        return res.status(400).json({
                            error: `Invalid data for option: ${JSON.stringify(option)}`,
                        });
                    }

                    newOptions.push({ optionName, optionValues });
                }
            }

            newVariants.push({ sku, price: variantPrice, stock, options: newOptions });
        }

        // Step 2: Update product fields
        product.name = name;
        product.image = updatedImage;
        product.description = description;
        product.price = parseFloat(price);
        product.additional_description = additional_description;
        product.additional_info = additional_info;
        product.shipping_return = shipping_return;
        product.meta_title = meta_title;
        product.meta_desc = meta_desc;
        product.is_active = is_active;
        product.category_id =  parsedCategoryId,
        product.tags = tags;
        product.continue_selling_when_out_of_stock = continue_selling_when_out_of_stock;

        // Save updated product
        await product.save();

        // Step 3: Delete old variants and options after successfully saving product
        const existingVariants = await ProductVariant.find({ product_id: productId });
        const existingVariantIds = existingVariants.map((v) => v._id);
        await VariantOption.deleteMany({ variant_id: { $in: existingVariantIds } });
        await ProductVariant.deleteMany({ product_id: productId });

        // Step 4: Create new variants and options
        const savedVariants = [];
        for (const variant of newVariants) {
            const { sku, price: variantPrice, stock, options } = variant;

            // Save new variant
            const productVariant = new ProductVariant({
                product_id: product._id,
                sku,
                price: parseFloat(variantPrice),
                stock,
            });
            await productVariant.save();

            const savedOptions = [];
            for (const option of options) {
                const { optionName, optionValues } = option;

                let optionDoc = await Option.findOne({ name: optionName });
                if (!optionDoc) {
                    optionDoc = new Option({ name: optionName });
                    await optionDoc.save();
                }

                const optionValueDocs = [];
                for (const value of optionValues) {
                    let optionValueDoc = await OptionValue.findOne({ option_id: optionDoc._id, value });
                    if (!optionValueDoc) {
                        optionValueDoc = new OptionValue({ option_id: optionDoc._id, value });
                        await optionValueDoc.save();
                    }

                    const variantOption = new VariantOption({
                        variant_id: productVariant._id,
                        option_value_id: optionValueDoc._id,
                    });
                    await variantOption.save();

                    optionValueDocs.push({
                        option_value_id: optionValueDoc._id,
                        value: optionValueDoc.value,
                    });
                }

                savedOptions.push({
                    option_id: optionDoc._id,
                    name: optionDoc.name,
                    values: optionValueDocs,
                });
            }

            savedVariants.push({
                variant_id: productVariant._id,
                sku: productVariant.sku,
                price: productVariant.price,
                stock: productVariant.stock,
                options: savedOptions,
            });
        }

        // Step 5: Fetch updated product data
        const updatedProduct = await Product.findById(productId)
            .populate('category_id', 'name')
            .populate('tags');

        const response = {
            _id: updatedProduct._id,
            name: updatedProduct.name,
            image: updatedProduct.image,
            description: updatedProduct.description,
            price: updatedProduct.price,
            additional_description: updatedProduct.additional_description,
            additional_info: updatedProduct.additional_info,
            shipping_return: updatedProduct.shipping_return,
            meta_title: updatedProduct.meta_title,
            meta_desc: updatedProduct.meta_desc,
            is_active: updatedProduct.is_active,
            category: updatedProduct.category_id ? updatedProduct.category_id.name : null,
            tags: updatedProduct.tags,
            continue_selling_when_out_of_stock: updatedProduct.continue_selling_when_out_of_stock,
            variants: savedVariants,
        };

        res.status(200).json({ message: 'Product updated successfully.', product: response });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};


exports.deleteProduct = async (req, res) => {
    const productId = req.params.productId;

    try {
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const variants = await ProductVariant.find({ product_id: productId });

        if (variants.length > 0) {
            const variantIds = variants.map((variant) => variant._id);

            await VariantOption.deleteMany({ variant_id: { $in: variantIds } });

            await ProductVariant.deleteMany({ _id: { $in: variantIds } });
        }

        await ProductOption.deleteMany({ product_id: productId });

        await Product.findByIdAndDelete(productId);

        res.status(200).json({ message: 'Product and all related data deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || "Failed to delete product and related data" });
    }
};




exports.getTags = async (req, res) => {
    try {
        // Use Tag.find() to retrieve all tags
        const tags = await Tag.find();
        res.status(200).json(tags);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tags.' });
    }
};