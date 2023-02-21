const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');

const PROTO_PATH = `${__dirname}/chat.proto`;
const SERVER_URI = "0.0.0.0:9090";

const usersInChat = [];
const observers = [];

const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);

const join = (call, callback) => {
  const user = call.request;

  const userExist = usersInChat.find((_user) => _user.name === user.name);
  if (!userExist) {
    usersInChat.push(user);
    callback(null, {
      error: 0,
      msg: "Success",
    });
  } else {
    callback(null, { error: 1, msg: "User already exist." });
  }
};

const getAllUsers = (call, callback) => {
  callback(null, { users: usersInChat });
};

const receiveMessage = (call, callback) => {
  observers.push({
    call
  });
};

const sendMessage = (call, callback) => {
  const chatObj = call.request;
  observers.forEach((observer) => {
    observer.call.write(chatObj);
  });
  callback(null, {
    type: "SEND"
  });
};

const server = new grpc.Server();
server.addService(protoDescriptor.ChatService.service, {
 join, getAllUsers, receiveMessage, sendMessage
});
server.bind(SERVER_URI, grpc.ServerCredentials.createInsecure());

server.start();

console.log("gRPC server is running!");
