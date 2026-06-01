const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema({
  studentEmail: String,
  courseName: String
});

module.exports = mongoose.model("Enrollment", enrollmentSchema);