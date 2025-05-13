require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
const allowedOrigins = ["http://localhost:5173", "http://localhost"];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);
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
