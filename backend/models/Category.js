
const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 30
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        isDefault: {
    type: Boolean,
    default: false
}
    },
    { timestamps: true }
);

// A user cannot create the same category twice.
categorySchema.index({ name: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("Category", categorySchema);