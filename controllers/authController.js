const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

const signToken = id => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: 60000
    });
}

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true
    }
    if (process.env.NODE_ENV === 'production') {
        cookieOptions.secure = true;
    }

    res.cookie('jwt', token, cookieOptions);

    user.password = undefined;

    res.status(statusCode).json({
        status: "success",
        token,
        data: {
            user
        }
    })
}

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        role: req.body.role
    });

    const url = `${req.protocol}://${req.get('host')}/me`;
    console.log(url)
    await new Email(newUser, url).sendWelcome();
    
    createSendToken(newUser, 201, res);
})

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new AppError('Please provide email and password!', 400));
    }
    //check if email and password are correct
    // the variable user created here is user document that has access to the custom methods
    const user = await User.findOne({email}).select('+password');
    const correctPassword = user ? await user.comparePassword(password, user.password) : false;
    
    if (!user || !correctPassword) {
        return next(new AppError('Wrong email or password!', 401));
    }

    createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expiresIn: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({
        status: 'success'
    })
}

exports.protect = catchAsync(async (req, res, next) => {
    // getting token and check if exists
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if(!token) {
        return next(new AppError('You are not logged in!', 401));
    }

    //verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    //check if user still exists
    const currentUser = await User.findById(decoded.id);

    if(!currentUser) {
        return next("The user does no longer exist!", 401);
    }

    //check if user changed password after token was issued
    /* if(currentUser.changedPasswordAfter(decoded.iat)) {
        return next("User recently changed password", 401);
    };
 */
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
});

exports.isLoggedIn = async (req, res, next) => {
    if (req.cookies.jwt) {
        try {
            const token = req.cookies.jwt;
            const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
            //check if user still exists
            const currentUser = await User.findById(decoded.id);

            if(!currentUser) {
                return next();
            }
            
            res.locals.user = currentUser;
            return next();
        } catch(err) {
            return next();
        }
    }
    next();
};

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError("You dont have permission", 403))
        }

        next();
    }
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
    //get user by email
    const user = await User.findOne({email: req.body.email});
    if(!user) {
        return next(new AppError("There is no user with that email", 404))
    }

    //create reset token
    const token = user.createResetToken();
    await user.save({ validateBeforeSave: false });

    //send email to user
    try {
        const resetURL =`${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${token}`;
        await new Email(user, resetURL).sendPasswordReset;
    
        res.status(200).json({
            status: "success",
            message: "Token sent to email"
        })
    } catch(err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next("Could not send email, please try again later!", 500)
    }

    
})

exports.resetPassword = catchAsync(async (req, res, next) => {
    //1. Get user by id
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({
        passwordResetToken: hashedToken, 
        passwordResetExpires: { $gt: Date.now() }
    });

    if(!user) {
        return next(new AppError("Token is invalid!", 400))
    }
    //2. Update changedPasswordAt with 'pre' middleware in user schema
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();
    //3. Log user in
    createSendToken(user, 200, res);

})

exports.updatePassword = catchAsync(async (req, res, next) => {
    // 1. Get user from data base
        const user = await User.findById(req.user.id).select('+password');
        if(!user) {
            return next(new AppError("There is no user with that email", 404))
        }
    // 2. Verify if password is correct
        const correctPassword = user ? await user.comparePassword(req.body.passwordCurrent, user.password) : false;
        
        if (!correctPassword) {
            return next(new AppError('Wrong password!', 401));
        }
    // 3. Update pass
        user.password = req.body.password;
        user.confirmPassword = req.body.confirmPassword;

        await user.save();
    // 4. Log in the user, send JWT
    createSendToken(user, 200, res);
})
