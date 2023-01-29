import { create } from "ipfs-http-client";
import { Buffer } from "buffer";

// const { REACT_APP_IPFS_HOST, REACT_APP_IPFS_PORT } = process.env;
const {
  REACT_APP_IPFS_HOST,
  REACT_APP_IPFS_PORT,
  REACT_APP_INFURA_PROJECT_ID,
  REACT_APP_INFURA_API_SECRET,
} = process.env;

const auth =
  "Basic " +
  Buffer.from(
    REACT_APP_INFURA_PROJECT_ID + ":" + REACT_APP_INFURA_API_SECRET
  ).toString("base64");

// const client = create({
//   url: "https://9d36-43-243-82-150.in.ngrok.io/ip4/127.0.0.1/tcp/5001",
//   // host: "127.0.0.1", // IPFS hostname
//   // port: 8080, // IPFS Gateway port
//   // protocol: "http", // Use http protocol to connect
//   apiHost: "127.0.0.1", // IPFS API hostname
//   apiPort: 5001, // IPFS API port
//   apiPath: "/ip4/127.0.0.1/tcp/5001",
// });
const client = create({
  host: REACT_APP_IPFS_HOST,
  port: REACT_APP_IPFS_PORT,
  protocol: "https",
  headers: {
    Authorization: auth,
  },
});

export { client };
