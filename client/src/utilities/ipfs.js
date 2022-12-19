import { create } from "ipfs-http-client";

const {
  REACT_APP_INFURA_HOST,
  REACT_APP_INFURA_PORT,
  REACT_APP_INFURA_PROJECT_ID,
  REACT_APP_API_SECRET,
} = process.env;

const auth =
  "Basic " + REACT_APP_INFURA_PROJECT_ID + ":" + REACT_APP_API_SECRET;

const client = create({
  host: REACT_APP_INFURA_HOST,
  port: REACT_APP_INFURA_PORT,
  protocol: "https",
  headers: {
    authorization: auth,
  },
});

export { client };
