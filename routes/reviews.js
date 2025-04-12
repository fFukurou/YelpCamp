const express = require('express');
const router = express.Router({ mergeParams: true });
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware.js');


const Campground = require('../models/campground');
const Review = require('../models/review');
const reviews = require('../controllers/reviews.js');

const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');



// POST REVIEW to campground
router.post('/', isLoggedIn ,validateReview, catchAsync(reviews.createReview));

// DELETE REVIEW
router.delete('/:reviewId', isLoggedIn, isReviewAuthor ,catchAsync(reviews.deleteReview));


module.exports = router;