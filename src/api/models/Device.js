const mongoose = require('mongoose');

const deviceScheme = new mongoose.Schema({
  description: String,
  address: String,
  maximumConsumption: Number
})

module.exports = mongoose.model('Device', deviceScheme);