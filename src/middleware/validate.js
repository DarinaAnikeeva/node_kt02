const Joi = require('joi');

const productSchema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    price: Joi.number().positive().required(),
    category: Joi.string().valid('electronics', 'clothing', 'food', 'other').required(),
    stock: Joi.number().integer().min(0).default(0),
    description: Joi.string().max(500).optional(),
});

function validateBody(req, res, next) {
    const { error } = productSchema.validate(req.body, { abortEarly: false });
    if (error) {
        const details = error.details.map(d => ({
            field: d.path.join('.'),
            message: d.message,
        }));
        return res.status(400).json({ error: 'Ошибка валидации', details });
    }
    next();
}

module.exports = { validateBody };