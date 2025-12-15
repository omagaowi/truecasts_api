import { MongoClient, Db } from "mongodb";

// require("dotenv").config();
// const dbURI = process.env.DATABASE_URL;

// Declare dbConnection with the correct Db type from the 'mongodb' package.
// We use `| null` to explicitly state that it can be uninitialized.
let dbConnection: Db | null = null;

// Define a type for the callback function for better type safety
type ConnectCallback = (err: Error | null) => void;

// Define a type for the module's exports
interface DbConnector {
  connectToDb: (cb: ConnectCallback) => void;
  getDb: () => Db;
}

const db_secret = process.env.MONGO_DB || "mongodb://localhost:27017/truecasts";

// const db_secret = process.env.MONGO_DB || "mongodb+srv://omaga:omagadvd12@pexaicluster.q2ipdab.mongodb.net/?retryWrites=true&w=majority&appName=pexaiCluster";

const dbConnector: DbConnector = {
  connectToDb: (cb) => {
    // MongoClient.connect returns a promise. We'll use the client to get the db instance.
    MongoClient.connect(db_secret)
      .then((client) => {
        // Correctly assign the Db object to our type-safe variable.
        dbConnection = client.db("truecasts");
        console.log("MongoDB connected");
        cb(null); // Call the callback with no error
      })
      .catch((err: Error) => {
        console.error("DB connection failed:", err);
        cb(err); // Call the callback with the error object
      });
  },

  getDb: () => {
    // Ensure dbConnection is not null before returning.
    // The `throw new Error` ensures that if it is null, an error is thrown.
    if (!dbConnection) {
      throw new Error("DB not initialized. Call connectToDb first.");
    }
    return dbConnection;
  },
};

export default dbConnector;
