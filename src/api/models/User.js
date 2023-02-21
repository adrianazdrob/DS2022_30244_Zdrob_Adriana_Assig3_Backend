const mongoose = require('mongoose');
const { isEmail } = require('validator');

const userScheme = new mongoose.Schema({
  name: String,
  role: {
    type: String,
    enum: ['ADMIN', 'CLIENT'],
    default: 'CLIENT'
  },
  email: {
    type: String,
    required: [true, 'Email address is required'],
    validate: {
      validator: isEmail,
      message: props => `${props.value} is not a valid email`
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    validate: {
      validator: function (value) {
        return value.length >= 6
      },
      message: () => 'Password must be at least six characters long'
    }
  }
})

module.exports = mongoose.model('User', userScheme);