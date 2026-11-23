const multer = require('multer')
const path = require('path')
const crypto = require('crypto')
const fs = require('fs')



const uploadDirs = ['uploads/products']
uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
})

const productStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/products')
    },
    filename: (req, file, cb) => {
        const uniqueName = `${crypto.randomUUID()}${path.extname(file.originalname)}`
        cb(null, uniqueName)
    }
})

const imageFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png']

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb(new Error('Разрешены только изображения: JPEG, PNG'), false);
    }
}


const uploadProduct = multer({
    storage: productStorage,
    fileFilter: imageFilter,
    limits: {
        fileSize: 2 * 1024 * 1024,
        files: 1
    }
})

module.exports = { uploadProduct }