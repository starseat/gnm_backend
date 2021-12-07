const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('gnm api server');
});

module.exports = router;
