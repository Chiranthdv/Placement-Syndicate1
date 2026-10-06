function encodeBase64(buffer) {
    return buffer.toString("base64");
}

function decodeBase64(base64String) {
    return Buffer.from(base64String, "base64");
}

module.exports = {
    encodeBase64,
    decodeBase64
};