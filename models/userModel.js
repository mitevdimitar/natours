const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "A user must have a name"],
      },
    email: {
        type: String,
        required: [true, "A user must have a email"],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide valid email']
    },
    photo: {
        type: String,
        default: 'default.jpg'
    },
    role: {
        type: String,
        enum: ["user", "guide", "lead-guide", "admin"],
        default: "user"
    },
    password: {
        type: String,
        required: [true, "A user must have a password"],
        minlength: [8, 'A password must have maximum 8 characters'],
        select: false
    },
    confirmPassword: {
        type: String,
        required: [true, "A user must have a confirmed password"],
        validate: {
            //this only works on create and save!
            validator: function(el) {
                return el === this.password;
            },
            message: "Passwords should be equal!"
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
})

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();

    //hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    this.confirmPassword = undefined;
    next();
})

// Update changedPasswordAt after password reset
userSchema.pre('save', function(next) {
    if (!this.isModified('password') || this.isNew) return next();
    this.passwordChangedAt = Date.now() - 1000;
    next();
})

userSchema.pre(/^find/, function(next) {
    this.find({ active: {$ne: false} });
    next();
})

//create instance method that is available in all documents
userSchema.methods.comparePassword = async function(passedPassword, userPassword) {
    return await bcrypt.compare(passedPassword, userPassword);
}

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestapm = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changedTimestapm;
    }

    return false;
}

userSchema.methods.createResetToken = function() {
    const token = crypto.randomBytes(32).toString("hex");
    this.passwordResetToken = crypto.createHash("sha256").update(token).digest("hex");
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return token;
}

const User = mongoose.model('User', userSchema);

module.exports = User;