const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res, next) => {
    const tours = await Tour.find();

    res.status(200).render('overview', {
        title: 'All tours',
        tours
    });
});

exports.getTour = catchAsync(async (req, res, next) => {
    // 1. get data for the tour (including reviews and guides)
    const filter = {slug :req.params.slug};
    // 2. build template
    const tour = await Tour
        .findOne(filter)
        .populate({
            path: 'reviews',
            fields: 'review rating user'
        });
    // 3. render the template using the data

    if(!tour) {
        return next(new AppError('No tour with that name!', 404));
    }

    res
        .status(200)
        .set(
            'Content-Security-Policy',
            "default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
        )
        .render('tour', {
        title: tour.name,
        tour
    });
});

exports.getLogin = (req, res, next) => {
    res
        .status(200)
        .set(
            'Content-Security-Policy',
            "connect-src 'self' https://cdnjs.cloudflare.com"
        )
        .render('login', {
            title: 'Log into your account'
        });
};

exports.getAccount = (req, res, next) => {
    res
        .status(200)
        .render('account', {
            title: 'User accountt'
        });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
    // 1. Find all bookings of the logged user
    const bookings = await Booking.find({user: req.user.id});
    console.log(bookings)

    // 2. Get the tours by the returned ids

    const tourIds = bookings.map(el => el.tour);
    const tours = await Tour.find({_id: { $in: tourIds }});
    console.log(tours)

    res.status(200).render('overview', {
        title: 'My tours',
        tours
    })
});