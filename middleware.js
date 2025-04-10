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