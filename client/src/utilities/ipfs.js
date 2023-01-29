import { NFTStorage } from "nft.storage";

const { REACT_APP_NFTSTORAGE_KEY } = process.env;
const client = new NFTStorage({ token: REACT_APP_NFTSTORAGE_KEY });

export default client;
