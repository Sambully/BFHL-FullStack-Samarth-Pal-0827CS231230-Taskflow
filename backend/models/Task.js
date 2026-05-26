const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [100, "Title must be at most 100 characters"],
      trim: true,
    },
    description: {
      type: String,
      maxlength: [500, "Description must be at most 500 characters"],
      trim: true,
      default: "",
    },
    importance: {
      type: Number,
      required: [true, "Importance is required"],
      min: [1, "Importance must be between 1 and 5"],
      max: [5, "Importance must be between 1 and 5"],
      validate: {
        validator: Number.isInteger,
        message: "Importance must be an integer",
      },
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
      validate: {
        validator: function (v) {
          if (this.isNew) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return v >= today;
          }
          return true;
        },
        message: "Due date must be a future date",
      },
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "completed"],
        message: 'Status must be "pending" or "completed"',
      },
      default: "pending",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.model("Task", taskSchema);
