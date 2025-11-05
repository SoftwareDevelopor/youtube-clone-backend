const express = require('express');
const { register, login, viewProfile, updateprofile, changepassword, forgotPassword, resetPassword, incrementpoints, subscribe, decrementsubscribe, hasFreeDownloadToday, activatePremium, checkPremiumStatus } = require('../Controllers/AuthController');
const authRouter = express.Router();
const multer = require('multer')
const path = require('path');
const uploads = multer({
    dest: "uploads/users",
});

// Public routes (no authentication required)

module.exports = (app) => {


    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'uploads/users')
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Math.random().toString(36).substring(2, 8);
            let imagepath = path.extname(file.originalname);
            cb(null, file.fieldname + '-' + uniqueSuffix + imagepath);
        }
    })

    const uploadimage = multer({ storage: storage });

    let singleimage = uploadimage.single('image');

    authRouter.post('/register', singleimage, register)

    authRouter.post('/login', login)

    authRouter.post('/view-profile', viewProfile)

    authRouter.post('/update-profile', singleimage, updateprofile)

    authRouter.post('/change-password', changepassword)

    authRouter.post('/forgot-password', forgotPassword)

    authRouter.post('/reset-password', resetPassword)

    authRouter.post('/increment-points', incrementpoints)

    authRouter.post('/subscribe',subscribe)

    authRouter.post('/decreasesubscribers', decrementsubscribe)

    authRouter.post('/hasFreeDownloadToday',hasFreeDownloadToday)

    authRouter.post('/activatePremium', activatePremium)

    authRouter.post('/checkPremiumStatus', checkPremiumStatus)

    app.use('/api/auth', authRouter)
}

