const express = require('express');
const router = express.Router()
const User = require('../models/User');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const {TOKEN} = require("../constants");

const createToken = (userId, email) => {
  return jwt.sign({
    id: userId,
    email
  }, process.env.TOKEN_KEY || TOKEN, {
    expiresIn: '2h'
  });
}

router.post('/register', async (req, res) => {
  try {
    const {email, name, password, role} = req.body;

    const isUser = await User.findOne({email});

    if (isUser) {
      res.status(401).json({
        error: 'Email is already used'
      });
      return;
    }

    bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        throw new Error('Server error')
      }

      const user = new User({
        name,
        email,
        password: hash,
        role
      });

      user.save().then(() => {
        user.password = undefined;
        const token = createToken(user._id, email);
        res.json({
          data: user,
          token
        })
      })
    })
  } catch(err) {
    res.status(401).json({
      error: err.message
    })
  }
})


router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("-__v");

    if(!user) {
      return res.status(401).json({
        error: 'Invalid credentials'
      })
    } else {
      bcrypt.compare(password, user.password, (err, result) => {
        if(result) {
          user.password = undefined;
          const token = createToken(user.id, email);
          return res.status(200).json({
            data: user,
            token
          })
        }
        return res.status(401).json({
          error: 'Invalid credentials'
        })
      })
    }
  } catch(err) {
    res.status(401);
  }
})
module.exports = router;