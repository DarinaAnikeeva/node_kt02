const { Router } = require('express')
const router = Router()
const { validateBody } = require('../middleware/validate')
const { uploadProduct } = require('../middleware/upload')

function handleUploadError(err, req, res, next) {
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Файл слишком большой' })
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ error: 'Превышено максимальное количество файлов' })
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ error: 'Неожиданное поле файла' })
    }
    if (err.message) {
        return res.status(400).json({ error: err.message })
    }
    next(err)
}

let products = [
    { id: 1, name: 'Laptop', price: 999, category: 'electronics', stock: 10, description: 'что-то очень интересное', imageUrl: null, createdAt: new Date().toISOString() },
    { id: 2, name: 'Apple', price: 999, category: 'food', stock: 10, description: 'что-то очень вкусное', imageUrl: null, createdAt: new Date().toISOString() },
];

router.get('/', (req, res) => {
    const { category, minPrice, maxPrice, page, limit } = req.query

    let result = [...products]

    if (category) {
        result = result.filter(p => p.category === category)
    }
    if (minPrice) {
        result = result.filter(p => p.price >= parseFloat(minPrice))
    }
    if (maxPrice) {
        result = result.filter(p => p.price <= parseFloat(maxPrice))
    }
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 5;
    result = result.slice((pageNum - 1) * limitNum, pageNum * limitNum);
    res.json({ total: products.length, data: result, page: pageNum, limit: limitNum });
})

router.get('/:id', (req, res) => {
    const id = parseInt(req.params.id, 10)
    const product = products.find(p => p.id === id)

    if (!product) {
        return res.status(404).json({ error: 'Продукт не найден' })
    }

    res.json(product)
})

router.post('/',
    uploadProduct.single('product'),
    handleUploadError,
    validateBody,
    (req, res) => {
        const newProduct = {
            id: products.length ? Math.max(...products.map(p => p.id)) + 1 : 1,
            ...req.body,
            stock: req.body.stock ?? 0,
            imageUrl: req.file ? `/uploads/products/${req.file.filename}` : null,
            createdAt: new Date().toISOString(),
        };
        products.push(newProduct);
        res.status(201).json(newProduct);
    })

router.put('/:id',
    uploadProduct.single('product'),
    handleUploadError,
    validateBody,
    (req, res) => {
        const id = parseInt(req.params.id, 10);
        const idx = products.findIndex(p => p.id === id);
        if (idx === -1) return res.status(404).json({ error: 'Продукт не найден' });

        products[idx] = { id, ...req.body, createdAt: products[idx].createdAt };
        res.json(products[idx]);
    });

router.patch('/:id',
    uploadProduct.single('product'),
    handleUploadError,
    (req, res) => {
        const id = parseInt(req.params.id, 10);
        const product = products.find(p => p.id === id);
        if (!product) return res.status(404).json({ error: 'Продукт не найден' });

        Object.assign(product, req.body);
        res.json(product);
    });


router.post('/:id/image',
    uploadProduct.single('image'),
    handleUploadError,
    (req, res) => {
        const id = parseInt(req.params.id, 10);
        const product = products.find(p => p.id === id);
        if (!product) return res.status(404).json({ error: 'Продукт не найден' });

        product.imageUrl = `/uploads/products/${req.file.filename}`;
        res.json(product);
    }
);

router.delete('/:id', (req, res) => {
    const id = parseInt(req.params.id, 10)
    products = products.filter(p => p.id !== id)
    res.sendStatus(204)
})

module.exports = router