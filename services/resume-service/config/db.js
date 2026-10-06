const mongoose = require("mongoose");

async function connectDB() {
    try {
        const baseUri = process.env.MONGO_URI || "mongodb://localhost:27017/experiencedb";
        const uri = baseUri.includes("/experiencedb") ? baseUri : (baseUri.endsWith("/") ? `${baseUri}experiencedb` : `${baseUri}/experiencedb`);
        await mongoose.connect(uri);

        console.log("MongoDB connected");
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    }
}

module.exports = connectDB;