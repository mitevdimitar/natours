const express = require('express');
const {
    getAllUsers, 
    createUser, 
    getMe, 
    getUser, 
    updateUser, 
    updateMe, 
    deleteMe, 
    deleteUser, 
    uploadUserPhoto,
    resizeUserPhoto
} = require('../controllers/userController');
const {signup, login, logout, forgotPassword, resetPassword, updatePassword, protect, restrictTo} = require('../controllers/authController');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);

//protect all routes after this middleware
router.use(protect);

router.patch('/update-password', updatePassword);

router.get('/me', getMe, getUser);
router.patch('/update-me', uploadUserPhoto, resizeUserPhoto, updateMe);
router.delete('/delete-me', deleteMe);

router.use(restrictTo('admin'));

router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;