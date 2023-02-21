const express = require('express');
const router = express.Router()
const User = require('../models/User');
const UserDevice = require('../models/UserDevice');
const auth = require('../middlewares/auth');

router.get('/', auth, async (req, res) => {
  try {
    const data = await User.find({}).select(["-__v", "-password"]);
    res.json({
      data
    })
  } catch(error) {
    res.status(500).json({
      error: error.message
    })
  }
})

router.put('/', auth, async (req, res) => {
  const currentUser = await User.findOne({ _id: req.user.id});

  if(req.body._id) {
    const { _id, name, email } = req.body;
    try {
      const user = await User.findOne({ _id });

      if(currentUser.role === "ADMIN") {
        user.role = req.body.role;
        user.name = name;
        user.email = email;

        user.save().then(() => {
          res.status(201).json({
            data: user
          });
        });
      } else {
        res.status(401).json({
          error: 'A client cannot edit users'
        })
      }

    } catch (e) {
      res.status(500).json({
        error: e.message
      })
    }
  } else {
    res.status(500).json({
      error: 'Invalid payload'
    })
  }
});

router.delete('/:id', auth, async (req, res) => {
  const id = req.params.id;
  const currentUser = await User.findOne({ _id: req.user.id});

  if(currentUser.role === "ADMIN") {
    const user = await User.remove({_id: id});
    await UserDevice.remove({ user: user._id });

    res.status(201).json({
      data: {
        message: "User removed"
      }
    })
  } else {
    res.status(500).json({
      error: "A client cannot remove users"
    })
  }
})
module.exports = router;