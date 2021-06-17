var mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

var classSchema = new mongoose.Schema(
  {
    topic: {
      type: String,
      required: true,
      trim: true,
    },
    start_time: {
      type: String,
      trim: true,
      required: true,
    },
    end_time: {
      type: String,
      trim: true,
      required: true,
    },
    instructor_id: { type: ObjectId, ref: "User", required: true },
    teacher_id: { type: ObjectId, ref: "User" },
    student_ids: [{ type: ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Class", classSchema);
