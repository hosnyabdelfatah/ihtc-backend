const dotenv = require('dotenv').config({path: "./config.env"});
const mongoose = require('mongoose');
const app = require('../app');

// const DB_LOCAL = `mongodb://127.0.0.1:27017/ihtc`;

const NEW_DB = `mongodb+srv://${process.env.NEW_DB_UN}:${process.env.NEW_DB_PW}@cluster0.s5jza.mongodb.net/ihtc?retryWrites=true&w=majority&appName=Cluster0`

const port = process.env.PORT || 5000;

mongoose.connect(NEW_DB, {
    maxPoolSize: 10, // Replaces `poolSize`, sets max concurrent connections in the pool
    serverSelectionTimeoutMS: 5000, // Adjust timeout for server selection
}).then(() => {
    console.log("DB Connection successful!");
}).catch((err) => {
    console.log(err.message);
});

app.listen(port, "0.0.0.0", () => {
    console.log(`App running on port ${port}`);
});