require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const routes = require("./routes");
app.use("/api", routes);

app.get("/", (req, res) => {
    res.send("hello from the backend");
});

const startServer = async () => {
    try {
        const loadData = require("./database/loadData");
        await loadData();

        app.listen(port, () => {
            console.log(`Server running on http://localhost:${port}`);
        });
    } catch (err) {
        console.error("Failed to start server:", err);
        process.exit(1);
    }
};

startServer();