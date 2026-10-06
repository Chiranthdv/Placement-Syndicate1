require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDB = require("./config/db");
const resumeRoutes = require("./routes/resumeRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Serve our test frontend
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/resume", resumeRoutes);

const PORT = process.env.PORT || 8050;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Resume Service API running on port ${PORT}`);
    });
});