const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const fileUpload = require('express-fileupload');

const pagesRoutes = require('./Routes/pages');
const adminRoutes = require('./Routes/admin_pages');
const CategoryRoutes = require('./Routes/admin_Categories');
const adminProductRoutes = require('./Routes/admin_product');





// intiallizing the express application
const app = express();

// view engine setting
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//setting the public folder
app.use(express.static(path.join(__dirname, 'public')));

// express file upload 
app.use(fileUpload());



// middlewar for body parser..
app.use(express.json());
app.use(express.urlencoded());



//setting of the applicaton variables
app.locals.errors = null;


// express-middleware for the express-session are as follows
// default store is used 
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}))

// middleware for the connect-flash messages
app.use(require('connect-flash')());
app.use(function(req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});


// connecting to the database
mongoose.connect(require('./config/database').databaseConnectionString)
    .then(() => {
        console.log('succesfully connected to the database')
    })
    .catch((err) => {
        console.log(err)
    });
// using the middleware for the parser the incomming data 


// getting all pages from the mongodb page collection and store all the pages in the header
// so we will storing the pages values in the local feilds 
require('./models/page').find({}).sort({ sorting: 1 }).exec((err, pages) => {
    if (err) {
        console.log(`error occured during the loading of the pages .. which want to store in the global application variables ${err}`)
    } else {
        app.locals.pages = pages;
    }
});





//using the routes request-hanlder
app.use('/', pagesRoutes);
app.use('/admin/pages', adminRoutes);
app.use('/admin/categories', CategoryRoutes);
app.use('/admin/products', adminProductRoutes);

var port = 3000;
app.listen(port, () => {
    console.log('listening in the port 3000');
});