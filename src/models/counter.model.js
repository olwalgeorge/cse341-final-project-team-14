const mongoose = require('mongoose');

/**
 * Counter Schema
 * @description Schema for auto-incrementing counters used for generating unique sequential IDs across the application
 */
const counterSchema = new mongoose.Schema({
    // Name of the counter (e.g., "inventoryID", "orderID", "productID")
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true
    },
    // Current counter value
    value: {
        type: Number,
        default: 0,
        min: 0
    },
    // Optional prefix to use with the generated ID
    prefix: {
        type: String,
        default: '',
        trim: true
    },
    // Optional settings for the counter
    settings: {
        // Padding length for formatting (e.g., 5 for "00001")
        padLength: {
            type: Number,
            default: 5,
            min: 1
        },
        // Increment step (usually 1)
        step: {
            type: Number,
            default: 1,
            min: 1
        }
    },
    // Metadata
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

// Update the updatedAt field before saving
counterSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Update the updatedAt field before findOneAndUpdate
counterSchema.pre('findOneAndUpdate', function() {
    this.set({ updatedAt: new Date() });
});

/**
 * Generate the next ID for a given counter name
 * @param {string} name - Name of the counter
 * @param {Object} options - Optional parameters
 * @param {string} options.prefix - Prefix to use (overrides stored prefix)
 * @param {number} options.padLength - Padding length (overrides stored setting)
 * @returns {Promise<string>} The generated ID
 */
counterSchema.statics.getNextId = async function(name, options = {}) {
    const counter = await this.findOneAndUpdate(
        { name },
        { $inc: { value: 1 } },
        { new: true, upsert: true }
    );
    
    const prefix = options.prefix || counter.prefix || '';
    const padLength = options.padLength || (counter.settings && counter.settings.padLength) || 5;
    
    // Format the sequence number with padding
    const sequence = counter.value.toString().padStart(padLength, "0");
    const generatedId = `${prefix}${sequence}`;
    
    return generatedId;
};

const Counter = mongoose.model('Counter', counterSchema);

module.exports = Counter;
