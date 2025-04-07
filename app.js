const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const { campgroundSchema, reviewSchema } = require('./schemas.js');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const Campground = require('./models/campground');
const Review = require('./models/review');

// MONGOOSE CONNECTION 
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log(`Database Connected`);
});


const app = express();

// MIDDLEWARE
app.set('view engine', 'ejs');
app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));


// JOI Schema Validation Middleware
const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}


// HOME
app.get('/', (req, res) => {
    res.render('home.ejs');
});

// SEE CAMPGROUNDS
app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index.ejs', { campgrounds });
}));

// POST CAMPGROUND
app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {

    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}));

// NEW CAMPGROUND PAGE
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new.ejs');
});


// SHOW
app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews'); 
    res.render('campgrounds/show.ejs', { campground });
}));

// EDIT CAMPGROUND PAGE
app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id); 
    res.render('campgrounds/edit.ejs', { campground });
}));

// EDIT CAMPGROUND PUT 
app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    res.redirect(`/campgrounds/${campground._id}`);
}));

// DELETE CAMPGROUND
app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}));


// POST REVIEW to campground
app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}));

// DELETE REVIEW
app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    // Find the Campground with the specified ID, then pull from the reviews array where the ID is equals reviewId
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } } );
    const review = await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}));

// CATCH ALL
app.all(/(.*)/, (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})

// ERROR HANDLING
app.use((err, req, res, next) => {
    const { statusCode = 500} = err;
    if(!err.message) err.message = 'Oh no, ERROR ERROR!';
    // res.status(statusCode).send(message);
    res.status(statusCode).render('error.ejs', { err: err });
})





app.listen(3000, () => {
    console.log(`----- App Listening on Port 3000 -----`);
});