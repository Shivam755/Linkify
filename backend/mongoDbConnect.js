const mongoose = require("mongoose");
const dotenv = require("dotenv");
const mongodb = require("mongodb");
dotenv.config();
const DBUri = `mongodb+srv://${process.env.MONGOUSERNAME}:${process.env.MONGOPASSWORD}@firsttest.dyrwxa0.mongodb.net/NodeApp?retryWrites=true&w=majority`;
const client = mongoose.connect(
  DBUri,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: mongodb.ServerApiVersion.v1,
  },
  (error) => {
    if (error) {
      console.log("Error!" + error);
    }
  }
);
// const client = new mongodb.MongoClient(DBUri, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   serverApi: mongodb.ServerApiVersion.v1,
// });

module.exports = client;
