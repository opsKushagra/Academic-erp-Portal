const express = require("express");
const router = express.Router();

const Enrollment = require("../models/Enrollment");


// Enroll Course
router.post("/add", async (req, res) => {
  try {
    const { studentEmail, courseName } = req.body;

    const existing = await Enrollment.findOne({
      studentEmail,
      courseName
    });

    if (existing) {
      return res.json({ msg: "Already Enrolled" });
    }

    const data = new Enrollment({
      studentEmail,
      courseName
    });

    await data.save();

    res.json({ msg: "Enrollment Success" });

  } catch (error) {
    res.status(500).json({ msg: "Server Error" });
  }
});


// Get Student Courses
router.get("/:email", async (req, res) => {
  const data = await Enrollment.find({
    studentEmail: req.params.email
  });

  res.json(data);
});

// Drop Course
router.delete("/drop", async (req, res) => {
  try {
    const { studentEmail, courseName } = req.body;

    await Enrollment.deleteOne({
      studentEmail,
      courseName
    });

    res.json({ msg: "Course Dropped Successfully" });

  } catch (error) {
    res.status(500).json({ msg: "Server Error" });
  }
});

module.exports = router;