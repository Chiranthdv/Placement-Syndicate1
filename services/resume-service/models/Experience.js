const mongoose = require("mongoose");

const experienceSchema = new mongoose.Schema(
    {
        companyName: String,
        role: String,
        quetions: mongoose.Schema.Types.Mixed,
        tips: mongoose.Schema.Types.Mixed,
        difficulty: String,
        rounds: mongoose.Schema.Types.Mixed
    },
    {
        collection: "experience"
    }
);

module.exports = mongoose.model("Experience", experienceSchema);