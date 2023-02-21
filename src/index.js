const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const router = require('./api/routes');

require("dotenv").config();
require('./db-connection');
require('./websocket').connectWebsocket();
require('./chat');

const app = express();

app.use(helmet());
app.use(bodyParser.json());
app.use(cors());
app.use(morgan('combined')); // this will log HTTP requests

app.use('/api', router);

app.listen(3001, () => {
  console.log('listening on port 3001');
});


