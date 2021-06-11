const express = require('express');
const {getCheckout, getAllBookings, createBooking, updateBooking, deleteBooking, getBooking} = require("../controllers/bookingController");
const {protect, restrictTo} = require("../controllers/authController");

const router = express.Router();

router.use(protect);

router.get('/checkout/:tourId', getCheckout);

router.route('/')
    .get(getAllBookings)
    .post(restrictTo('user'), createBooking);

router.route('/:id')
    .get(getBooking)
    .patch(restrictTo('user', 'admin'), updateBooking)
    .delete(restrictTo('user', 'admin'), deleteBooking);


module.exports = router;