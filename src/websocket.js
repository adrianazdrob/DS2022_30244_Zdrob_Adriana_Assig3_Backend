const webSocketsServerPort = 8000;
const webSocketServer = require('websocket').server;
const http = require('http');
const Device = require('./api/models/Device');
const { parse } = require('csv-parse');
const fs = require('fs');

const connectWebsocket = () => {
  const server = http.createServer();
  server.listen(webSocketsServerPort);
  const wsServer = new webSocketServer({
    httpServer: server
  });

  const clients = {};
  const getUniqueID = () => {
    const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    return s4() + s4() + '-' + s4();
  };

  const sendMessage = json => {
    Object.keys(clients).map(client => {
      clients[client].sendUTF(json);
    })
  }

  wsServer.on('request', function(request) {
    const userID = getUniqueID();
    // You can rewrite this part of the code to accept only the requests from allowed origin
    const connection = request.accept(null, request.origin);
    clients[userID] = connection;

    connection.on('message', async message => {
      if(message.type === 'utf8') {
        const clientData = JSON.parse(message.utf8Data);

        if(clientData.content.toLowerCase().trim() === 'connect' && clientData.id) {
          const device = await Device.findOne({ _id: clientData.device});

          let lines = [];
          const sendLines = () => {
            let index = 1;
            const interval = setInterval(() => {
              sendMessage(JSON.stringify({
                measurementValue: lines[index],
                timestamp: new Date(),
                deviceId: clientData.device,
                maximumConsumption: device.maximumConsumption
              }));

              if(index >= lines.length) {
                clearInterval(interval)
              }
              index++;
            }, 5000);
          }

          fs.createReadStream(`${__dirname}/sensor.csv`)
              .pipe(parse({ delimiter: ',', from_line: 1}))
              .on("data", row => {
                lines.push(row[0]);
              })
              .on('end', () => {
                sendMessage(JSON.stringify({
                  measurementValue: lines[0],
                  timestamp: new Date(),
                  deviceId: clientData.device,
                  maximumConsumption: device.maximumConsumption
                }));
                sendLines()
              });
        }
      }
    })

    connection.on('close', (event) => {
      const json = {
        data: `${userID} left the connection`
      }
      delete clients[userID];

      sendMessage(JSON.stringify(json));
    })
  });
}

module.exports = {
  connectWebsocket
}
