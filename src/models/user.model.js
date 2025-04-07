const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [20, "Username must be at most 20 characters"],
      match: [
        /^(?!\d)[a-zA-Z0-9_]+$/,
        "Username must not start with a number and must contain only alphanumeric characters and underscores",
      ],
      index: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email is not valid"],
      index: true,
      lowercase: true,
    },
    password: {
      type: String,
      trim: true,
      match: [
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,50}$/,
        "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character",
      ],
      select: false,
      required: false,
    },

    fullName: {
      type: String,
      trim: true,
      minlength: [3, "Full name must be at least 3 characters"],
      maxlength: [50, "Full name must be at most 50 characters"],
    },
    facebookId: {
      type: String,
      default: null,
    },
    googleId: {
      type: String,
      default: null,
    },
    twitterId: {
      type: String,
      default: null,
    },
    githubId: {
      type: String,
      default: null,
    },
    profilePicture: {
      type: String,
    },
    bio: {
      type: String,
    },
    website: {
      type: String,
    },
    location: {
      type: String,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["SUPERADMIN", "ADMIN", "USER", "ORG"],
      default: "USER",
    },
    userID: {
      type: String,
      unique: true,
      match: [/^SM-\d{5}$/],
      index: true,
    },
    phoneNumber: {
      type: String,
    },
    preferences: {
      type: Object,
    },
    githubAccessToken: {
      type: String,
    },
    githubRefreshToken: {
      type: String,
    },
    googleAccessToken: {
      type: String,
    },
    googleRefreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Hash the password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (error) {
    return next(error);
  }
});

// Method to compare passwords
UserSchema.methods.isPasswordMatch = async function (password) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
