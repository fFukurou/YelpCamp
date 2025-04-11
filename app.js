const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');

const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');

// IMPORTING ROUTES
const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds.js');
const reviewRoutes = require('./routes/reviews.js');


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

// SESSION AND FLASH
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

// PASSPORT
 app.use(passport.initialize());
 app.use(passport.session()); 
 passport.use(new LocalStrategy(User.authenticate()));

 passport.serializeUser(User.serializeUser());
 passport.deserializeUser(User.deserializeUser());

// FLASHES AND CURRENTUSER
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


// app.get('/fakeUser', async (req, res) => {
//     const user = new User({email: 'dummy@gmail.com', username: 'dummy'});
//     // .register is a METHOD created by PASSPORT, it will take an user object + a password;
//     const newUser = await User.register(user, 'dummy');
//     res.send(newUser);
// })

// USING IMPORTED ROUTES
app.use('/', userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

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