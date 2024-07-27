// import the required modules
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const fs = require("fs");

// Load the proto file
const packageDefinition = protoLoader.loadSync("../def.proto", {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const proto = grpc.loadPackageDefinition(packageDefinition);

// Create a new gRPC server
const server = new grpc.Server();

// Add and implement the service methods
server.addService(proto.UnaryService.service, {
  echo: (call, callback) => {
    console.log(`Unary Echo called with args: ${JSON.stringify(call.request)}`);

    if (!call.request.message) {
      callback({ code: 400, details: "message is required" });
      return;
    }

    callback(null, { echo: call.request.message });
  },
});

server.addService(proto.StreamService.service, {
  serverStreamEcho: (call) => {
    console.log(
      `Server Stream Echo called with args: ${JSON.stringify(call.request)}`
    );

    if (!call.request.message) {
      call.emit("error", { code: 400, details: "message is required" });
      return;
    }

    // echo message 5 times

    for (let i = 0; i < 5; i++) {
      call.write({ echo: call.request.message });
    }

    call.end();
  },

  clientStreamEcho: (call, callback) => {
    let message = "";

    call.on("data", (data) => {
      console.log(
        `Client Stream Echo called with data: ${JSON.stringify(data)}`
      );
      message += data.message;
    });

    call.on("end", () => {
      if (!message) {
        callback({ code: 400, details: "message is required" });
        return;
      }

      callback(null, { echo: message });
    });
  },
});

// Load the self-signed certificate and private key
const rootCert = fs.readFileSync("../certs/selfSigned.crt");
const privateKey = fs.readFileSync("../certs/selfSigned.key");

// Bind the server to the port and start the grpc server
server.bindAsync(
  "0.0.0.0:50001",
  grpc.ServerCredentials.createSsl(
    rootCert,
    [{ private_key: privateKey, cert_chain: rootCert }],
    true
  ),
  (error, port) => {
    console.log(`Server running at http://0.0.0.0:${port}`);
  }
);
