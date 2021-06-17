require("dotenv").config();
const app = require("express")();
const server = require("http").createServer(app);
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const { errorHandler } = require("./helper/errorHandler");

// import of routes
const authRoutes = require("./routes/auth");
const classRoutes = require("./routes/class");
const userRoutes = require("./routes/user");

// DB connection
mongoose.connect(process.env.DATABASE, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

// Middlewares
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());

// Routes
app.get("/", (req, res) => {
  res.send("Welcome to Class Management System Backend!!");
});
app.use("/api", authRoutes);
app.use("/api", classRoutes);
app.use("/api", userRoutes);

//error handelling middleware
app.use(errorHandler);

// Port number
const PORT = process.env.PORT || 5000;

// Server running check
app.listen(PORT, () => {
  console.log("=========================================");
  console.log(`Server listening at http://localhost:${PORT}`);
});

// DB connection check
const db = mongoose.connection;
db.on("error", (err) => {
  console.log("=========================================");
  console.log("Error:", err);
  console.log("=========================================");
});
db.once("open", () => {
  console.log("=========================================");
  console.log("DB CONNECTED");
  console.log("=========================================");
});
