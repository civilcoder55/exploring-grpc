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

// Load the self-signed certificate and private key
const rootCert = fs.readFileSync("../certs/selfSigned.crt");
const privateKey = fs.readFileSync("../certs/selfSigned.key");

// Create a new gRPC service client and connect to the server with SSL
const client = new proto.UnaryService(
  "localhost:50001",
  grpc.credentials.createSsl(rootCert, privateKey, rootCert)
);

// Define async echo function to call the echo method on the server
const echo = (params) => {
  return new Promise((resolve, reject) => {
    client.echo(params, (error, response) => {
      if (error) {
        console.log(`${error.code} - ${error.details}`);
      } else {
        console.log(response.echo);
      }
      resolve();
    });
  });
};

// (async () => {
//   await echo({ message: "Test unary grpc" });
//   await echo({});
//   await echo({ message: "" });
// })();

// test streams
const streamClient = new proto.StreamService(
  "localhost:50001",
  grpc.credentials.createSsl(rootCert, privateKey, rootCert)
);

// streamClient
//   .serverStreamEcho({ message: "Test server stream grpc" })
//   .on("data", (data) => {
//     console.log(data.echo);
//   })
//   .on("error", (error) => {
//     console.log(`${error.code} - ${error.details}`);
//   })
//   .on("end", () => {
//     console.log("Server stream ended");
//   });

// streamClient
//   .serverStreamEcho({})
//   .on("data", (data) => {
//     console.log(data.echo);
//   })
//   .on("error", (error) => {
//     console.log(`${error.code} - ${error.details}`);
//   })
//   .on("end", () => {
//     console.log("Server stream ended");
//   });

const clientStreamEchoCall = streamClient.clientStreamEcho(
  (error, response) => {
    if (error) {
      console.log(`${error.code} - ${error.details}`);
    } else {
      console.log(response.echo);
    }
  }
);

clientStreamEchoCall.write({ message: "Test " });
clientStreamEchoCall.write({ message: "Client " });
clientStreamEchoCall.write({ message: "Stream" });
clientStreamEchoCall.end();
