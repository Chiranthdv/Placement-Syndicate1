const MODEL_NAME = "Xenova/all-MiniLM-L6-v2";

let extractor = null;


/*
    Load the embedding model.

    We load it only once and reuse it
    for all future searches.
*/
async function loadModel() {

    if (extractor) {
        return extractor;
    }

    console.log(
        "Loading semantic embedding model..."
    );

    // @huggingface/transformers is ESM,
    // so we use dynamic import here.
    const {
        pipeline
    } = await import("@huggingface/transformers");

    extractor = await pipeline(
        "feature-extraction",
        MODEL_NAME
    );

    console.log(
        "Semantic embedding model loaded"
    );

    return extractor;
}


/*
    Convert text into an embedding vector.

    Example:

    "Java backend developer"

            ↓

    [0.12, -0.43, 0.81, ...]
*/
async function generateEmbedding(text) {

    const model = await loadModel();

    const output = await model(
        text,
        {
            pooling: "mean",
            normalize: true
        }
    );

    return Array.from(output.data);
}


/*
    Calculate cosine similarity.

    Because our embeddings are normalized,
    the result is effectively the similarity
    between the two vectors.
*/
function cosineSimilarity(vectorA, vectorB) {

    if (vectorA.length !== vectorB.length) {
        throw new Error(
            "Vectors must have the same dimensions"
        );
    }

    let dotProduct = 0;

    let magnitudeA = 0;

    let magnitudeB = 0;


    for (let i = 0; i < vectorA.length; i++) {

        dotProduct +=
            vectorA[i] * vectorB[i];

        magnitudeA +=
            vectorA[i] * vectorA[i];

        magnitudeB +=
            vectorB[i] * vectorB[i];
    }


    magnitudeA =
        Math.sqrt(magnitudeA);

    magnitudeB =
        Math.sqrt(magnitudeB);


    if (
        magnitudeA === 0 ||
        magnitudeB === 0
    ) {
        return 0;
    }


    return (
        dotProduct /
        (magnitudeA * magnitudeB)
    );
}


/*
    Convert an interview experience
    into searchable text.
*/
function experienceToText(experience) {

    const questions =
        Array.isArray(experience.quetions)
            ? experience.quetions.join(" ")
            : (typeof experience.quetions === "string" ? experience.quetions : "");

    const tips =
        Array.isArray(experience.tips)
            ? experience.tips.join(" ")
            : (typeof experience.tips === "string" ? experience.tips : "");

    const rounds =
        Array.isArray(experience.rounds)
            ? experience.rounds.map(r => typeof r === "object" ? `${r.roundName || ""} ${r.description || ""}` : r).join(" ")
            : (typeof experience.rounds === "string" ? experience.rounds : "");


    return `
        ${experience.companyName || ""}
        ${experience.role || ""}
        ${questions}
        ${tips}
        ${experience.difficulty || experience.difficultyLevel || ""}
        ${rounds}
    `;
}


/*
    Perform semantic search.

    1. Generate embedding for resume
    2. Generate embedding for every experience
    3. Calculate cosine similarity
    4. Sort by similarity
*/
async function searchSemantic(
    resumeText,
    experiences
) {

    console.log(
        "Generating resume embedding..."
    );

    const resumeEmbedding =
        await generateEmbedding(
            resumeText
        );


    console.log(
        "Resume embedding generated"
    );

    const results = [];


    for (const experience of experiences) {

        const experienceText =
            experienceToText(
                experience
            );


        const experienceEmbedding =
            await generateEmbedding(
                experienceText
            );


        const similarity =
            cosineSimilarity(
                resumeEmbedding,
                experienceEmbedding
            );


        results.push({
            experience,
            score: similarity
        });
    }


    results.sort(
        (a, b) =>
            b.score - a.score
    );


    return results;
}


module.exports = {
    generateEmbedding,
    cosineSimilarity,
    searchSemantic
};