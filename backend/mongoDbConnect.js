// import { config } from ;
// import { MongoClient, ServerApiVersion } from 'mongodb';

const dotenv = require("dotenv");
const mongodb = require('mongodb');
dotenv.config();
const uri = `mongodb+srv://Superslayer4:${process.env.PASSWORD}@firsttest.dyrwxa0.mongodb.net/?retryWrites=true&w=majority`;
const client = new mongodb.MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: mongodb.ServerApiVersion.v1 });
module.exports= {client};
// export default client;
// async function connect() {
//   try {
//     const database = client.db('sample_mflix');
//     const movies = database.collection('movies');
//     // Query for a movie that has the title 'Back to the Future'
//     const query = { title: 'Back to the Future' };
//     const movie = await movies.findOne(query);
//     // console.log(movie);
//   } finally {
//     // Ensures that the client will close when you finish/error
//     await client.close();
//   }
// }
// connect().then(()=>console.log(`Database connected`)).catch(err=>console.log(err));
