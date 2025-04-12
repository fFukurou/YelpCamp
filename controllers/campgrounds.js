const Campground = require('../models/campground');

// SEE CAMPGROUNDS
module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index.ejs', { campgrounds });
}

// NEW CAMPGROUND PAGE
module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new.ejs');
}

// POST CAMPGROUND
module.exports.createCampground = async (req, res, next) => {

    const campground = new Campground(req.body.campground);
    // Passing in the author/user to our SHOW page, to be rendered;
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
};

// SHOW
module.exports.showCampground = async (req, res) => {
    // console.log(req.session);
    // console.log(`---------------`)
    // console.log(res.locals)
    const campground = await Campground.findById(req.params.id).populate({path: 'reviews', populate: {path: 'author'}}).populate('author'); 
    if(!campground) {
        req.flash('error', 'Cannot find that campground.');
        return res.redirect("/campgrounds");
    }
    res.render('campgrounds/show.ejs', { campground });
}

// EDIT CAMPGROUND PAGE
module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id); 
    if(!campground) {
        req.flash('error', 'Cannot find that campground.');
        return res.redirect("/campgrounds");
    }
    res.render('campgrounds/edit.ejs', { campground });
}

// EDIT CAMPGROUND PUT 
module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}

// DELETE CAMPGROUND
module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground!');
    res.redirect('/campgrounds');
}