const natural = require("natural");

const {
    searchSemantic
} = require("./semanticSearch");

const tokenizer =
    new natural.WordTokenizer();


// =====================================================
// 1. TOKENIZATION
// =====================================================

function tokenize(text) {

    return tokenizer.tokenize(
        text
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, " ")
    );
}


// =====================================================
// 2. CONVERT EXPERIENCE INTO SEARCHABLE TEXT
// =====================================================

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


// =====================================================
// 3. TERM FREQUENCY
// =====================================================

function calculateTermFrequency(tokens) {

    const frequencies = new Map();

    for (const token of tokens) {

        frequencies.set(
            token,
            (frequencies.get(token) || 0) + 1
        );
    }

    return frequencies;
}


// =====================================================
// 4. BM25 SCORE
// =====================================================

function calculateBM25(
    queryTokens,
    documentTokens,
    allDocuments,
    k1 = 1.5,
    b = 0.75
) {

    const documentFrequency =
        new Map();


    // How many documents contain each word?
    for (const document of allDocuments) {

        const uniqueTokens =
            new Set(document);

        for (const token of uniqueTokens) {

            documentFrequency.set(
                token,
                (documentFrequency.get(token) || 0) + 1
            );
        }
    }


    const totalDocuments =
        allDocuments.length;


    const averageDocumentLength =
        allDocuments.reduce(
            (sum, document) =>
                sum + document.length,
            0
        ) / totalDocuments;


    const termFrequency =
        calculateTermFrequency(
            documentTokens
        );


    const documentLength =
        documentTokens.length;


    let score = 0;


    const uniqueQueryTokens =
        new Set(queryTokens);


    for (const term of uniqueQueryTokens) {

        const tf =
            termFrequency.get(term) || 0;


        if (tf === 0) {
            continue;
        }


        const df =
            documentFrequency.get(term) || 0;


        const idf =
            Math.log(
                1 +
                (
                    totalDocuments -
                    df +
                    0.5
                ) /
                (
                    df +
                    0.5
                )
            );


        const numerator =
            tf * (k1 + 1);


        const denominator =
            tf +
            k1 *
            (
                1 -
                b +
                b *
                (
                    documentLength /
                    averageDocumentLength
                )
            );


        score +=
            idf *
            (
                numerator /
                denominator
            );
    }


    return score;
}


// =====================================================
// 5. NORMALIZE BM25 SCORES
// =====================================================

function normalizeScores(results) {

    const scores =
        results.map(
            result => result.score
        );


    const maxScore =
        Math.max(...scores);

    const minScore =
        Math.min(...scores);


    // If every score is identical
    if (maxScore === minScore) {

        return results.map(result => ({
            ...result,
            normalizedScore: 1
        }));
    }


    return results.map(result => ({

        ...result,

        normalizedScore:
            (
                result.score -
                minScore
            ) /
            (
                maxScore -
                minScore
            )
    }));
}


// =====================================================
// 6. HYBRID SEARCH
// =====================================================

async function searchExperiences(
    resumeText,
    experiences
) {

    // ---------------------------------------------
    // A. Tokenize resume
    // ---------------------------------------------

    const queryTokens =
        tokenize(resumeText);


    // ---------------------------------------------
    // B. Convert experiences into documents
    // ---------------------------------------------

    const documents =
        experiences.map(
            experience =>
                tokenize(
                    experienceToText(
                        experience
                    )
                )
        );


    // ---------------------------------------------
    // C. Calculate BM25 scores
    // ---------------------------------------------

    const bm25Results =
        experiences.map(
            (experience, index) => {

                const score =
                    calculateBM25(
                        queryTokens,
                        documents[index],
                        documents
                    );


                return {
                    experience,
                    score
                };
            }
        );


    // ---------------------------------------------
    // D. Normalize BM25
    // ---------------------------------------------

    const normalizedBM25 =
        normalizeScores(
            bm25Results
        );


    // ---------------------------------------------
    // E. Semantic search
    // ---------------------------------------------

    console.log(
        "\nRunning semantic search..."
    );


    const semanticResults =
        await searchSemantic(
            resumeText,
            experiences
        );


    // ---------------------------------------------
    // F. Create lookup map for semantic scores
    // ---------------------------------------------

    const semanticScoreMap =
        new Map();


    semanticResults.forEach(result => {

        semanticScoreMap.set(
            result.experience._id.toString(),
            result.score
        );
    });


    // ---------------------------------------------
    // G. Combine BM25 + Semantic
    // ---------------------------------------------

    const hybridResults =
        normalizedBM25.map(result => {

            const id =
                result.experience._id.toString();


            const semanticScore =
                semanticScoreMap.get(id) || 0;


            const hybridScore =
                (
                    0.5 *
                    result.normalizedScore
                ) +
                (
                    0.5 *
                    semanticScore
                );


            return {

                experience:
                    result.experience,

                bm25Score:
                    result.score,

                normalizedBM25Score:
                    result.normalizedScore,

                semanticScore,

                hybridScore
            };
        });


    // ---------------------------------------------
    // H. Sort by hybrid score
    // ---------------------------------------------

    hybridResults.sort(
        (a, b) =>
            b.hybridScore -
            a.hybridScore
    );


    // ---------------------------------------------
    // I. Return top 3
    // ---------------------------------------------

    return hybridResults.slice(0, 3);
}


// =====================================================
// EXPORT
// =====================================================

module.exports = {
    searchExperiences
};