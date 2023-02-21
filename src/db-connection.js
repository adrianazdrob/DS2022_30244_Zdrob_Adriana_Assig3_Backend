const { MongoClient, ServerApiVersion } = require('mongodb');
const mongoose = require("mongoose");

const uri = "mongodb+srv://sdProject:RHOWjsEDIPGum20l@cluster0.lber91h.mongodb.net/sd?retryWrites=true&w=majority";

mongoose.connect(uri,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
);