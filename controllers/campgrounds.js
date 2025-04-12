const Campground = require('../models/campground');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require('../cloudinary/index.js');

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
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    // get the files uploaded using multer and map them to the .images property
    campground.images = req.files.map(f => ({url: f.path, filename: f.filename}));
    // Passing in the author/user to our SHOW page, to be rendered;
    campground.author = req.user._id;
    await campground.save();
    // console.log(campground); 
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
    const imgs = req.files.map(f => ({url: f.path, filename: f.filename}));
    campground.images.push(...imgs);
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}})
        // console.log(campground);
    }
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