const path = require('path');
const morgan = require('morgan');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
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


const allowedOrigins = [
    "http://localhost:3000",
    "https://ihtc.vercel.app",
    "https://ihtc-q2teign6e-hosnyabdelfatahs-projects.vercel.app"
];

const corsOptions = {
    // origin: (origin, callback) => {
    //     if (allowedOrigins.includes(origin) || !origin) {
    //         callback(null, true);
    //     } else {
    //         callback(new Error('Not allowed by CORS'));
    //     }
    // },
    origin: '*',
    credentials: true,// Important for cookies/credentials
    exposedHeaders: ['Set-Cookie', 'Date', 'ETag'],
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));


//Middleware
app.use(bodyParser.urlencoded({extended: false})) //Review it
app.use(bodyParser.json());
app.use(express.urlencoded({extended: true})); //Review it
app.use(express.json({limit: "10kb"}));
app.use(cookieParser());

app.use((req, res, next) => {
    res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade'); // Adjust as needed
    next();
});

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://your-frontend-origin.com'); // Replace with your frontend URL
    res.setHeader('Access-Control-Allow-Credentials', 'true'); // Allow cookies/credentials
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin'); // Set referrer policy
    next();
});


app.use((req, res, next) => {
    console.log('Request Origin:', req.get('Origin'));
    next();
});

app.get('/', (req, res) => {
    res.send('Hello in IHTC World!');
});
app.use('/specialties', doctorSpecialtyRoutes);
app.use('/organizations', organizationRoutes);
app.use('/roles', roleRoutes);
app.use('/languages', languageRoutes);
app.use('/countries', countryRoutes);
app.use('/doctors', doctorRoutes);
app.use('/campaigns', campaignRoutes);

module.exports = app;