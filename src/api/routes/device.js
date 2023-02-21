const express = require('express');
const router = express.Router()
const Device = require('../models/Device');
const User = require('../models/User');
const auth = require('../middlewares/auth');
const UserDevice = require("../models/UserDevice");
const {add} = require("nodemon/lib/rules");

router.get('/', auth, async (req, res) => {
  try {
    const data = await Device.find({});
    res.json({
      data
    })
  } catch(error) {
    res.status(500).json({
      error: error.message
    })
  }
})

router.get('/mine', auth, async (req, res) => {
  try {
    const user = req.user;
    const userDevices =  await UserDevice.find({ user: user.id}).select('device');

    const devices = await Device.find({ '_id': {
        $in: userDevices.map(item => item.device.toHexString())
      }});
    res.json({
      data: devices
    })
  } catch(error) {
    res.status(500).json({
      error: error.message
    })
  }
})

router.post('/', auth, (req, res) => {
  try {
    const {description, address, maximumConsumption} = req.body;

    if (description && address && maximumConsumption) {
      const device = new Device({
        description,
        address,
        maximumConsumption
      })

      device.save().then(async () => {
        const user = await User.findOne({ '_id': req.user.id});

        if (user.role === 'ADMIN') {
          const {userId} = req.body;

          const userDevice = new UserDevice({
            device: device._id,
            user: userId !== "" && userId ? userId : req.user.id
          });

          userDevice.save().then(() => console.log("userDevice saved as admin"))
        } else {
          const userDevice = new UserDevice({
            device: device._id,
            user: req.user.id
          });
          userDevice.save().then(() => console.log("userDevice saved as client"))
        }

        res.json({
          data: device
        })
      })
    } else {
      res.json({
        error: "Complete all fields"
      })
    }
  } catch(err) {
    res.json({
      error: err.message
    })
  }
})
router.put('/', auth, async (req, res) => {
  const currentUser = await User.findOne({ _id: req.user.id});

  if(req.body._id) {
    const { _id, description, address, maximumConsumption } = req.body;
    try {
      const device = await Device.findOne({ _id });

      if(currentUser.role === "ADMIN") {
        device.description = description;
        device.address = address;
        device.maximumConsumption = maximumConsumption;

        device.save().then(() => {
          res.status(201).json({
            data: device
          });
        });
      } else {
        res.status(401).json({
          error: 'A client cannot edit devices'
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
    const device = await Device.remove({_id: id});
    await UserDevice.remove({ device: device._id });

    res.status(201).json({
      data: {
        message: "Device removed"
      }
    })
  } else {
    res.status(500).json({
      error: "A client cannot remove devices"
    })
  }
})
module.exports = router;