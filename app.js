const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');

const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');

// IMPORTING ROUTES
const campgrounds = require('./routes/campgrounds.js');
const reviews = require('./routes/reviews.js');


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
app.use(express.static(path.join(__dirname, 'public')));

// SESSION
const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // a week from now...
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
}

app.use(session(sessionConfig));
app.use(flash());

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use("/campgrounds", campgrounds);
app.use("/campgrounds/:id/reviews", reviews);

// HOME
app.get('/', (req, res) => {
    res.render('home.ejs');
});


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