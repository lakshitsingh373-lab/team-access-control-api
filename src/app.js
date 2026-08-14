require("dotenv").config();
const express = require("express");
const authRoutes = require("./routes/authRoutes");
const orgRoutes = require("./routes/organizationroutes");
const sessionRoutes = require("./routes/sessionroutes");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const app = express();

app.use(express.json());
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/auth", authRoutes);
app.use("/orgs", orgRoutes);
app.use("/sessions", sessionRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

module.exports = app;