const path = require('path');
const morgan = require('morgan');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const userTypeRoutes = require('./routes/userTypeRoutes');
const doctorSpecialtyRoutes = require('./routes/doctorSpecialtyRoutes');
const organizationRoutes = require('./routes/organizationRoutes');
const roleRoutes = require('./routes/roleRoutes');
const languageRoutes = require('./routes/languageRoutes');
const countryRoutes = require('./routes/countryRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const campaignRoutes = require('./routes/campaignRoutes');

const app = express();

app.use(morgan('tiny'));

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, `public`)));


//Middleware
app.use(bodyParser.urlencoded({extended: false})) //Review it
app.use(bodyParser.json());
app.use(express.urlencoded({extended: true})); //Review it
app.use(express.json({limit: "10kb"}));
app.use(cookieParser());


app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS, PUT, PATCH, DELETE"
    );
    res.setHeader(
        "Access-Control-Allow-Headers", "x-access-token, Origin, X-Requested-With, Content-Type, Accept"
    );
    res.setHeader("Access-Control-Allow-Credentials", true);
    res.setHeader("Access-Control-Max-Age", "1800");
    res.setHeader("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, PATCH, OPTIONS");
    next();
});

const corsOptions = {
    origin: ["http://localhost:3000", "https://glitch.com/edit/#!/tungsten-shell-weaver", "*"],
    credentials: true, //access-control-allow-credentials:true
    exposedHeaders: ['Set-Cookie', 'Date', 'ETag'],
    withCredentials: true,
    optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options('*', cors());

app.use('/user-type', userTypeRoutes);
app.use('/specialties', doctorSpecialtyRoutes);
app.use('/organizations', organizationRoutes);
app.use('/roles', roleRoutes);
app.use('/languages', languageRoutes);
app.use('/countries', countryRoutes);
app.use('/doctors', doctorRoutes);
app.use('/campaigns', campaignRoutes);

module.exports = app;