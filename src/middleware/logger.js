function logger(req, res, next) {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        const color = res.statusCode >= 400 ? '\x1b' : '\x1b';
        console.log(`${color} ${req.method} ${req.url} ${res.statusCode} ${duration}ms\x1b`);
    })

    next()
}

module.exports = logger