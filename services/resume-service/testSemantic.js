require("dotenv").config();

const {
    searchSemantic
} = require("./services/semanticSearch");

const connectDB = require("./config/db");
const Experience = require("./models/Experience");

async function testSemanticSearch() {

    try {

        await connectDB();

        const experiences =
            await Experience.find({}).lean();

        console.log(
            `Loaded ${experiences.length} experiences`
        );


        const resumeText = `
            Java JavaScript React Node.js
            Express MongoDB REST APIs
            Data Structures Algorithms
            DBMS Operating Systems
            Object Oriented Programming
        `;


        const results =
            await searchSemantic(
                resumeText,
                experiences
            );


        console.log(
            "\n----- SEMANTIC SEARCH RESULTS -----\n"
        );


        results.forEach((result) => {

            console.log(
                `${result.experience.companyName} - ${result.experience.role}`
            );

            console.log(
                "Semantic Score:",
                result.score
            );

            console.log();
        });


        console.log(
            "------------------------------------"
        );


        process.exit(0);

    } catch (error) {

        console.error(
            "Semantic search failed:",
            error
        );

        process.exit(1);
    }
}


testSemanticSearch();