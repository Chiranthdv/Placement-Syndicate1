const { PDFParse } = require("pdf-parse");
const mammoth = require("mammoth");

async function extractResumeText(fileBuffer, fileExt) {

    if (fileExt === "pdf") {
        const parser = new PDFParse({
            data: fileBuffer
        });

        const result = await parser.getText();

        await parser.destroy();

        return result.text;
    }

    if (fileExt === "docx") {
        const result = await mammoth.extractRawText({
            buffer: fileBuffer
        });

        return result.value;
    }

    throw new Error(
        `Unsupported file type: ${fileExt}`
    );
}

module.exports = {
    extractResumeText
};