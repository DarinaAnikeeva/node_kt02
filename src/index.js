require('dotenv').config();
const express = require('express')
const path = require('path');
const productsRouter = require('./routes/products')

const logger = require('./middleware/logger')
const errorHandler = require('./middleware/errorHandler')

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use(logger);
app.use('/api/products', productsRouter);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`)
})

module.exports = app