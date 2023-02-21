const mongoose = require('mongoose');

const userDeviceSchema = new mongoose.Schema({
  user: mongoose.Schema.Types.ObjectId,
  device: mongoose.Schema.Types.ObjectId,
})

module.exports = mongoose.model('UserDevice', userDeviceSchema);