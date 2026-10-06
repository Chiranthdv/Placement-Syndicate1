const express = require("express");
const multer = require("multer");

const {
    publishResumeJob
} = require("../services/rabbitmq");

const {
    encodeBase64
} = require("../utils/base64");

const ResumeFeedback = require("../models/ResumeFeedback");
const Experience = require("../models/Experience");

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Middleware to accept either 'resume' or 'file' field name from multipart form
const uploadMiddleware = (req, res, next) => {
    upload.single("resume")(req, res, (err) => {
        if (req.file) return next();
        upload.single("file")(req, res, (err2) => {
            if (err || err2) {
                return res.status(400).json({ error: (err || err2).message });
            }
            next();
        });
    });
};

router.get("/test", (req, res) => {
    res.json({
        message: "Resume service is working"
    });
});

router.get("/health", (req, res) => {
    res.json({
        status: "UP",
        service: "resume-service"
    });
});

router.post(
    "/upload",
    uploadMiddleware,
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    message: "Resume file is required (field name 'resume' or 'file')"
                });
            }

            const allowedTypes = [
                "application/pdf",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "application/msword",
                "application/octet-stream"
            ];

            const ext = req.file.originalname.split(".").pop().toLowerCase();
            if (!allowedTypes.includes(req.file.mimetype) && !["pdf", "docx"].includes(ext)) {
                return res.status(400).json({
                    message: "Only PDF and DOCX files are supported"
                });
            }

            // Record initial processing state in MongoDB
            await ResumeFeedback.findOneAndUpdate(
                { filename: req.file.originalname },
                {
                    filename: req.file.originalname,
                    status: "processing",
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                { upsert: true, new: true }
            );

            const fileBase64 = encodeBase64(req.file.buffer);

            const message = {
                filename: req.file.originalname,
                file_ext: ext,
                file_b64: fileBase64,
                timestamp: new Date().toISOString()
            };

            await publishResumeJob(message);

            res.status(202).json({
                message: "Resume received and queued for AI analysis",
                filename: req.file.originalname,
                fileId: req.file.originalname,
                status: "processing"
            });
        } catch (error) {
            console.error("Resume upload failed:", error);
            res.status(500).json({
                message: "Failed to queue resume: " + error.message
            });
        }
    }
);

// Fetch AI feedback for a given uploaded resume
router.get("/feedback/:filename", async (req, res) => {
    try {
        const feedback = await ResumeFeedback.findOne({
            filename: req.params.filename
        }).sort({ createdAt: -1 });

        if (!feedback) {
            return res.status(404).json({
                status: "not_found",
                message: "No analysis found for this file"
            });
        }

        res.json({
            filename: feedback.filename,
            status: feedback.status || "completed",
            score: feedback.score || 85,
            strengths: feedback.strengths,
            improvements: feedback.improvements,
            advice: feedback.advice,
            matches: feedback.matches,
            corpusSize: feedback.corpusSize,
            createdAt: feedback.createdAt,
            updatedAt: feedback.updatedAt
        });
    } catch (error) {
        console.error("Failed to fetch feedback:", error);
        res.status(500).json({ error: "Failed to retrieve feedback" });
    }
});

// Alias for status check
router.get("/status/:filename", async (req, res) => {
    try {
        const feedback = await ResumeFeedback.findOne({
            filename: req.params.filename
        }).sort({ createdAt: -1 });

        if (!feedback) {
            return res.json({ status: "processing" });
        }
        res.json({ status: feedback.status });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get similar companies
router.get("/similar/:companyName", async (req, res) => {
    try {
        const targetCompany = req.params.companyName.toLowerCase();
        const limit = parseInt(req.query.limit) || 5;

        const allExperiences = await Experience.find({}).lean();
        const otherCompanies = Array.from(
            new Set(
                allExperiences
                    .map(e => e.companyName)
                    .filter(c => c && c.toLowerCase() !== targetCompany)
            )
        ).slice(0, limit);

        res.json({
            targetCompany: req.params.companyName,
            similarCompanies: otherCompanies
        });
    } catch (error) {
        console.error("Similar companies error:", error);
        res.status(500).json({ error: "Failed to fetch similar companies" });
    }
});

module.exports = router;