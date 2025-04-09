const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { campgroundSchema } = require('../schemas.js');

const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');


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

// SEE CAMPGROUNDS
router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index.ejs', { campgrounds });
}));

// POST CAMPGROUND
router.post('/', validateCampground, catchAsync(async (req, res, next) => {

    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}));

// NEW CAMPGROUND PAGE
router.get('/new', (req, res) => {
    res.render('campgrounds/new.ejs');
});


// SHOW
router.get('/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews'); 
    if(!campground) {
        req.flash('error', 'Cannot find that campground.');
        return res.redirect("/campgrounds");
    }
    res.render('campgrounds/show.ejs', { campground });
}));

// EDIT CAMPGROUND PAGE
router.get('/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id); 
    if(!campground) {
        req.flash('error', 'Cannot find that campground.');
        return res.redirect("/campgrounds");
    }
    res.render('campgrounds/edit.ejs', { campground });
}));

// EDIT CAMPGROUND PUT 
router.put('/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}));

// DELETE CAMPGROUND
router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground!');
    res.redirect('/campgrounds');
}));

module.exports = router;