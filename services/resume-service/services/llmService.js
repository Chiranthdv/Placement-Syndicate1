const Groq = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEYS
});


function buildExperienceContext(experiences) {

    return experiences
        .map((result, index) => {

            const experience =
                result.experience;

            const questions =
                Array.isArray(experience.quetions)
                    ? experience.quetions.join("\n- ")
                    : (typeof experience.quetions === "string" ? experience.quetions : "");

            const tips =
                Array.isArray(experience.tips)
                    ? experience.tips.join("\n- ")
                    : (typeof experience.tips === "string" ? experience.tips : "");

            const rounds =
                Array.isArray(experience.rounds)
                    ? experience.rounds.map(r => typeof r === "object" ? `${r.roundName || ""}: ${r.description || ""}` : r).join(", ")
                    : (typeof experience.rounds === "string" ? experience.rounds : "");

            return `
INTERVIEW EXPERIENCE ${index + 1}

Company:
${experience.companyName}

Role:
${experience.role}

Difficulty:
${experience.difficulty}

Interview Rounds:
${rounds}

Questions:
- ${questions}

Tips:
- ${tips}
`;

        })
        .join("\n----------------------\n");
}


async function generateResumeAdvice(
    resumeText,
    topExperiences
) {

    const experienceContext =
        buildExperienceContext(
            topExperiences
        );


    const prompt = `
You are an AI assistant helping a software
engineering candidate prepare for technical
interviews.

Analyze the candidate's resume and the
provided interview experiences.

Use the interview experiences as supporting
context.

Do not invent interview questions or company
information that is not present in the
provided context.

========================
CANDIDATE RESUME
========================

${resumeText}


========================
RELEVANT INTERVIEW EXPERIENCES
========================

${experienceContext}


========================
TASK
========================

Provide useful interview preparation advice.

Structure the response as:

1. Resume Strengths

2. Important Technical Topics to Prepare

3. Topics That Need More Preparation

4. Interview Preparation Suggestions

5. Questions the Candidate Should Practice

Keep the answer practical and concise.
`;


    const completion =
        await groq.chat.completions.create({

            messages: [
                {
                    role: "system",
                    content:
                        "You are a helpful technical interview preparation assistant."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],

            model:"openai/gpt-oss-20b",

            temperature: 0.2,

            max_tokens: 1500
        });


    return completion
        .choices[0]
        .message
        .content;
}


module.exports = {
    generateResumeAdvice
};