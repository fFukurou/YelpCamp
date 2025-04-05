const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const Campground = require('./models/campground');

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

// HOME
app.get('/', (req, res) => {
    res.render('home.ejs');
});

// SEE CAMPGROUNDS
app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index.ejs', { campgrounds });
});

// POST CAMPGROUND
app.post('/campgrounds', async (req, res) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
})

// NEW CAMPGROUND PAGE
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new.ejs');
})


// SHOW
app.get('/campgrounds/:id', async (req, res) => {
    const campground = await Campground.findById(req.params.id); 
    res.render('campgrounds/show.ejs', { campground });
});

// EDIT CAMPGROUND PAGE
app.get('/campgrounds/:id/edit', async (req, res) => {
    const campground = await Campground.findById(req.params.id); 
    res.render('campgrounds/edit.ejs', { campground });
})

// EDIT CAMPGROUND PUT 
app.put('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    res.redirect(`/campgrounds/${campground._id}`);
})

// DELETE CAMPGROUND
app.delete('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
})








app.listen(3000, () => {
    console.log(`----- App Listening on Port 3000 -----`);
});