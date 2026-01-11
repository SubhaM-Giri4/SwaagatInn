const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

require('dotenv').config();

//const MONGO_URL = "mongodb://127.0.0.1:27017/Undiscover_India";
const dbUrl =  process.env.ATLASDB_URL;

// const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require("./utils/ExpressError");
//const {listingSchema , reviewSchema} = require("./schema.js");
//const Review = require("./models/review.js");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;

const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user.js");
const LocalStrategy = require("passport-local"); // Changed variable name to LocalStrategy for convention




const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const tripPlannerRoutes = require('./routes/tripPlanner');

main()
    .then(() => {
        console.log("connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));


const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: "justtest",
    },
    touchAfter: 24 * 3600,
});

store.on("error", () => {
    console.log("ERROR IN MONGO SESSION STORE");
});

const sessionOptions = {
    store,
    secret: "justtest",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
    },
};


// app.get("/", (req, res) => {
//     res.send("Hi, I am root");
// });
//no need of root

app.use(session(sessionOptions));
app.use(flash());

// Passport.js setup
app.use(passport.initialize());
app.use(passport.session());
// Correctly register the LocalStrategy with passport
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user || null;// this store the curr user info
    next();
})

app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews",reviewsRouter);
app.use("/",userRouter);

app.use('/trip-planner', tripPlannerRoutes);


app.use((err, req, res, next) => {
    let {statusCode = 500 , message = "something went wrong"} = err;
    //res.status(statusCode).send(message);//normal error send
    res.render("error.ejs", { message: message });//we send our custom design error
});


app.listen(8080, () => {
    console.log("server is listening to port 8080");
});