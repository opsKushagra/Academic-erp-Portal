const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors({
  origin: "http://localhost:3000"
}));

app.use(express.json());

const authRoutes = require("./routes/auth");
const enrollmentRoutes = require("./routes/enrollment");
app.use("/api/auth", authRoutes);
app.use("/api/enroll", enrollmentRoutes);

mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err));

app.listen(5000, ()=>console.log("Server running"));


