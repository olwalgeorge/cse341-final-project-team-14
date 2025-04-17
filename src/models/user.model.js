const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema
 */
const userSchema = new mongoose.Schema({
  // Basic Information
  userID: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    // The format USR-00001 is now handled by the Counter-based ID generation
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    // eslint-disable-next-line
    match: [
      // eslint-disable-next-line
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email address'
    ]
  },
  password: {
    type: String,
    // Password required only if not using OAuth/social login
    required: function() {
      // Password is not required if githubId is present
      return !this.githubId;
    },
    matches: [
      // eslint-disable-next-line
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,50}$/,
      'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character, and be between 8 to 50 characters'
    ]
    // Password will be hashed before saving
  },
  
  // GitHub OAuth
  githubId: {
    type: String,
    unique: true,
    sparse: true
  },
  githubAccessToken: String,
  githubRefreshToken: String,
  
  // Personal Information
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minlength: [2, 'Full name must be at least 2 characters long'],
    maxlength: [100, 'Full name cannot exceed 100 characters']
  },
  avatar: {
    type: String,
    default: ''
  },
  
  // Role and Permissions
  role: {
    type: String,
    enum: ['USER', 'SUPERVISOR', 'MANAGER', 'ADMIN', 'SUPERADMIN'],
    default: 'USER'
  },
  permissions: {
    type: [String],
    default: []
  },
  
  // Status and Verification
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationExpires: Date,
  
  // Password Reset
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  
  // Token Management
  tokenVersion: {
    type: Number,
    default: 1
  },
  
  // Security and Login
  lastLogin: {
    type: Date,
    default: null
  },
  lastLoginIP: String,
  failedLoginAttempts: {
    type: Number,
    default: 0
  },
  lockedUntil: {
    type: Date,
    default: null
  },
  rateLimitExemptUntil: {
    type: Date,
    default: null
  },
  
  // Metadata and Tracking
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: false });

/**
 * Middleware to update timestamps and hash password if modified
 */
userSchema.pre('save', async function(next) {
  this.updatedAt = new Date();
  
  // Only hash the password if it has been modified (or is new)
  // This check prevents double-hashing when we manually hash in the service
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    // Check if password is already hashed (starts with $2a$ or $2b$)
    // This prevents double-hashing if the password is already hashed in the service
    if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) {
      return next();
    }
    
    // Hash password with bcryptjs
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Method to compare passwords
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Add an alias for backward compatibility
userSchema.methods.isPasswordMatch = async function(candidatePassword) {
  return await this.comparePassword(candidatePassword);
};

/**
 * Virtual for user's full name
 */
userSchema.virtual('name').get(function() {
  return this.fullName;
});

/**
 * Remove password and sensitive fields when converting to JSON
 */
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.verificationToken;
    delete ret.resetPasswordToken;
    delete ret.resetPasswordExpires;
    delete ret.failedLoginAttempts;
    delete ret.__v;
    return ret;
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
