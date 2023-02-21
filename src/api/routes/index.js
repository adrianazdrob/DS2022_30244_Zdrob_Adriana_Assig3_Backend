const express = require('express');
const router = express.Router()

router.use('/auth', require('./auth'));
router.use('/users', require('./user'));
router.use('/devices', require('./device'));
router.use('/user-device', require('./userDevice'));

module.exports = router;