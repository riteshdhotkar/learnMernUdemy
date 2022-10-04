const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI'); //call connection string from default.json


connectDB = async () => {
    try {
        await mongoose.connect(db, {
            useNewUrlParser: true
        });

        console.log('MongoDB Connected..');
    } catch(err) {
        console.error(err.message);
        process.exit(1); //exit process with failure 
    }
}

module.exports = connectDB;

