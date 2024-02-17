const mongoose = require('mongoose');

const database = async () => {
    try {
        // Connect to MongoDB with the appropriate connection string
await mongoose.connect("mongodb+srv://chlghamihicham:Hicham9Move@cluster0.kloojm6.mongodb.net/?retryWrites=true&w=majority", {
            useNewUrlParser: true, // Use the new URL parser
            useUnifiedTopology: true, // Use the new Server Discover and Monitoring engine
            // serverSelectionTimeoutMS: 5000, // Increase the timeout
            // socketTimeoutMS: 45000, // Increase the timeout
        });

        console.log('Connected to MongoDB');
    } catch (error) {
        console.log('error mongodb', error)
        // console.log(error)
        // console.error(error)
        // console.error('Error connecting to MongoDB:', error);
    }
};

module.exports = database;








// mongodb+srv://chlghamihicham:Hicham9Move@cluster0.kloojm6.mongodb.net/?retryWrites=true&w=majority