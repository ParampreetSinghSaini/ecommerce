const axios = require('axios');
const { faker } = require('@faker-js/faker');
const FormData = require('form-data');
const fs = require('fs');

// Generate fake category data
const generateFakeCategoryData = () => {
    return {
        name: faker.commerce.department(),
        description: faker.lorem.sentence(),
    };
};

// Generate fake product data
const generateFakeProductData = (category_id) => {
    return {
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: parseFloat(faker.commerce.price()),
        additional_description: faker.lorem.sentences(2),
        additional_info: faker.lorem.paragraph(),
        shipping_return: faker.lorem.sentences(2),
        meta_title: faker.commerce.productAdjective(),
        meta_desc: faker.lorem.sentence(),
        is_active: faker.datatype.boolean(),
        category_id, 
        tags: [faker.commerce.department(), faker.commerce.color()],
        continue_selling_when_out_of_stock: faker.datatype.boolean(),
        variants: [
            {
                sku: faker.random.alphaNumeric(10),
                price: parseFloat(faker.commerce.price()),
                stock: faker.datatype.number({ min: 1, max: 100 }),
                options: [
                    {
                        optionName: 'Size',
                        optionValues: ['Small', 'Medium', 'Large'],
                    },
                    {
                        optionName: 'Color',
                        optionValues: ['Red', 'Blue', 'Green'],
                    },
                ],
            },
        ],
    };
};

const saveCategoryAndProduct = async () => {
    
    const fakeCategory = generateFakeCategoryData();

    try {
        const categoryResponse = await axios.post('http://localhost:3001/addCategory', fakeCategory);
        const category_id = categoryResponse.data._id; 

        console.log('Category created successfully:', categoryResponse.data);

        if (!category_id) {
            throw new Error('Failed to retrieve category ID.');
        }

        const fakeProduct = generateFakeProductData(category_id);

        const formData = new FormData();
        Object.entries(fakeProduct).forEach(([key, value]) => {
            formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
        });

        formData.append('file', fs.createReadStream('public/productImg')); 

        const productResponse = await axios.post('http://localhost:3001/addProduct', formData, {
            headers: formData.getHeaders(),
        });

        console.log('Product created successfully:', productResponse.data);
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
};

// Run the script
saveCategoryAndProduct();
