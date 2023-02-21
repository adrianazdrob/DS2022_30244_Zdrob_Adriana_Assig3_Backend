const express = require('express');
const router = express.Router()
const UserDevice = require('../models/UserDevice');

router.get('/', async (req, res) => {
  try {
    const data = await UserDevice.find({});
    res.json(data)
  } catch(error) {
    res.status(500).json({
      error: error.message
    })
  }
})
module.exports = router;