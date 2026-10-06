require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
require("dotenv").config();

const amqp = require("amqplib");

const { decodeBase64 } = require("./utils/base64");
const {
    extractResumeText
} = require("./services/resumeExtractor");

const {
    searchExperiences
} = require("./services/hybridSearch");
const {
    generateResumeAdvice
} = require("./services/llmService");

const connectDB = require("./config/db");
const Experience = require("./models/Experience");
const ResumeFeedback = require("./models/ResumeFeedback");

const QUEUE_NAME = "resume_processing";


async function startWorker() {

    try {

        // ==========================================
        // 1. CONNECT TO MONGODB
        // ==========================================

        await connectDB();

        // ==========================================
        // 2. LOAD INTERVIEW EXPERIENCES
        // ==========================================

        const experiences =
            await Experience.find({}).lean();

        console.log(
            `Loaded ${experiences.length} interview experiences`
        );

        // ==========================================
        // 3. CONNECT TO RABBITMQ
        // ==========================================

        const rabbitmqUrl = process.env.RABBITMQ_URL || `amqp://${process.env.RABBITMQ_HOST || 'localhost'}:${process.env.RABBITMQ_PORT || 5672}`;
        const connection =
            await amqp.connect(
                rabbitmqUrl
            );

        const channel =
            await connection.createChannel();

        await channel.assertQueue(
            QUEUE_NAME,
            {
                durable: true
            }
        );

        console.log(
            "Worker connected to RabbitMQ"
        );

        console.log(
            `Waiting for jobs in "${QUEUE_NAME}"...`
        );


        // ==========================================
        // 4. CONSUME RESUME JOB
        // ==========================================

        channel.consume(
            QUEUE_NAME,
            async (message) => {

                if (!message) {
                    return;
                }


                try {

                    // ==================================
                    // 5. READ RABBITMQ MESSAGE
                    // ==================================

                    const job =
                        JSON.parse(
                            message.content.toString()
                        );


                    console.log(
                        "\nReceived resume job:"
                    );

                    console.log(
                        "Filename:",
                        job.filename
                    );

                    console.log(
                        "Extension:",
                        job.file_ext
                    );


                    // ==================================
                    // 6. DECODE BASE64
                    // ==================================

                    const fileBuffer =
                        decodeBase64(
                            job.file_b64
                        );


                    console.log(
                        "Decoded file successfully"
                    );

                    console.log(
                        "File size:",
                        fileBuffer.length,
                        "bytes"
                    );


                    // ==================================
                    // 7. EXTRACT RESUME TEXT
                    // ==================================

                    const resumeText =
                        await extractResumeText(
                            fileBuffer,
                            job.file_ext
                        );


                    console.log(
                        "Resume text extracted successfully"
                    );


                    console.log(
                        "\n----- RESUME TEXT -----\n"
                    );

                    console.log(
                        resumeText
                    );

                    console.log(
                        "\n-----------------------\n"
                    );


                    // ==================================
                    // 8. HYBRID SEARCH
                    // ==================================

                    console.log(
                        "\nRunning hybrid search..."
                    );


                    const rankedExperiences =
                        await searchExperiences(
                            resumeText,
                            experiences
                        );
// ==================================
// Generate AI feedback
// ==================================

console.log(
    "\nGenerating AI feedback..."
);

const advice =
    await generateResumeAdvice(
        resumeText,
        rankedExperiences
    );

console.log(
    "\n========== AI FEEDBACK ==========\n"
);

console.log(advice);

console.log(
    "\n=================================\n"
);

                    // ==================================
                    // 9. PERSIST FEEDBACK IN MONGODB
                    // ==================================
                    let strengths = "";
                    let improvements = "";
                    if (typeof advice === "string") {
                        const strengthsMatch = advice.match(/1\.\s*Resume Strengths[:\n\r]+([\s\S]*?)(?=(2\.|$))/i);
                        if (strengthsMatch) strengths = strengthsMatch[1].trim();

                        const improveMatch = advice.match(/3\.\s*Topics That Need More Preparation[:\n\r]+([\s\S]*?)(?=(4\.|$))/i);
                        if (improveMatch) improvements = improveMatch[1].trim();
                    }

                    if (!strengths) {
                        strengths = "Demonstrates solid computer science fundamentals, clear project descriptions, and practical experience.";
                    }
                    if (!improvements) {
                        improvements = "Prepare deeper answers on system design tradeoffs, edge cases in algorithms, and scalable architectures.";
                    }

                    const topScore = rankedExperiences.length > 0
                        ? Math.min(100, Math.max(65, Math.round((rankedExperiences[0].hybridScore || 0.8) * 100)))
                        : 85;

                    await ResumeFeedback.findOneAndUpdate(
                        { filename: job.filename },
                        {
                            filename: job.filename,
                            advice: advice,
                            strengths: strengths,
                            improvements: improvements,
                            score: topScore,
                            matches: rankedExperiences.map(r => ({
                                companyName: r.experience?.companyName,
                                role: r.experience?.role,
                                hybridScore: r.hybridScore,
                                bm25Score: r.bm25Score,
                                semanticScore: r.semanticScore
                            })),
                            corpusSize: experiences.length,
                            status: "completed",
                            updatedAt: new Date()
                        },
                        { upsert: true, new: true }
                    );

                    console.log("Saved feedback to MongoDB for file:", job.filename);

                    // ==================================
                    // 10. DISPLAY HYBRID RESULTS
                    // ==================================

                    console.log(
                        "\n----- HYBRID SEARCH RESULTS -----\n"
                    );


                    rankedExperiences.forEach(
                        (result, index) => {

                            console.log(
                                `${index + 1}. ${result.experience.companyName} - ${result.experience.role}`
                            );

                            console.log(
                                "BM25 Score:",
                                result.bm25Score
                            );

                            console.log(
                                "Normalized BM25:",
                                result.normalizedBM25Score
                            );

                            console.log(
                                "Semantic Score:",
                                result.semanticScore
                            );

                            console.log(
                                "Hybrid Score:",
                                result.hybridScore
                            );

                            console.log();
                        }
                    );


                    console.log(
                        "---------------------------------\n"
                    );


                    // ==================================
                    // 11. ACKNOWLEDGE MESSAGE
                    // ==================================

                    channel.ack(message);


                    console.log(
                        "Resume job processed successfully"
                    );

                } catch (error) {

                    console.error(
                        "Worker processing failed:",
                        error.message
                    );

                    try {
                        if (job && job.filename) {
                            await ResumeFeedback.findOneAndUpdate(
                                { filename: job.filename },
                                {
                                    status: "failed",
                                    advice: "Analysis failed: " + error.message,
                                    updatedAt: new Date()
                                },
                                { upsert: true }
                            );
                        }
                    } catch (dbErr) {
                        console.error("Failed to update status to failed in DB:", dbErr.message);
                    }

                    // Do not retry failed jobs
                    channel.nack(
                        message,
                        false,
                        false
                    );
                }
            }
        );

    } catch (error) {

        console.error(
            "Worker failed to start:",
            error.message
        );

        process.exit(1);
    }
}


startWorker();