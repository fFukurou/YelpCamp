const { campgroundSchema, reviewSchema } = require('./schemas.js');
const Campground = require('./models/campground.js');
const Review = require('./models/review.js');
const ExpressError = require('./utils/ExpressError.js');



// Checks if the user is authenticated (function provided by passport), and if not redirect them to the login page;
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        // Saves the original url into the session
        // which will be clared when the user logs in, but our storeReturnTo middleware will grab it from the session and store it in the locals
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be logged in to do that...');
        return res.redirect('/login');
    }  
    next();
}


// Stores the page the user was currently at before being redirected to the login page; 
module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

// VALIDATES the creation of a new campground body against the campground SCHEMA;
module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

// Checks whether the current user is the AUTHOR of X campground before allowing Y action;
module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)){
        req.flash('error', 'Yu do not have permission to do that.');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)){
        req.flash('error', 'Yu do not have permission to do that.');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}


// JOI Schema Validation Middleware
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}
