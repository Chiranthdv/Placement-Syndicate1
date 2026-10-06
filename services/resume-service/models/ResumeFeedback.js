const mongoose = require("mongoose");

const resumeFeedbackSchema = new mongoose.Schema(
    {
        filename: String,
        advice: String,
        strengths: String,
        improvements: String,
        score: Number,

        matches: mongoose.Schema.Types.Mixed,

        corpusSize: Number,

        bm25Weight: Number,
        semanticWeight: Number,

        status: {
            type: String,
            default: "processing"
        },

        createdAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        collection: "resume_feedback"
    }
);

module.exports = mongoose.model(
    "ResumeFeedback",
    resumeFeedbackSchema
);