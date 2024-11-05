const path = require('path');
const morgan = require('morgan');
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');

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


// const allowedOrigins = [
//     "http://localhost:3000",
//     "https://ihtc.vercel.app",
//     "https://ihtc-q2teign6e-hosnyabdelfatahs-projects.vercel.app"
// ];
//
// const corsOptions = {
//     origin: '*',
//     methods: '*',
//     allowedHeaders: ['Content-Type', 'Authorization'],
//     credentials: true,// Important for cookies/credentials
//     exposedHeaders: ['Set-Cookie', 'Date', 'ETag'],
//     optionsSuccessStatus: 200
// };
//
// app.use(cors(corsOptions));
//
// app.use((req, res, next) => {
//     res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade'); // Adjust as needed
//     next();
// });
//
// app.use((req, res, next) => {
//     res.setHeader('Access-Control-Allow-Origin', '*'); // Replace with your frontend URL
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     res.setHeader('Access-Control-Allow-Credentials', 'true'); // Allow cookies/credentials
//     res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
//     res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin'); // Set referrer policy
//     res.setHeader(
//         'Access-Control-Allow-Headers',
//         'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
//     )
//     next();
// });
//
//
//
//
// app.use((req, res, next) => {
//     res.setHeader('Access-Control-Allow-Credentials', 'true');
//     next();
// });


//Middleware
app.use(bodyParser.urlencoded({extended: false})) //Review it
app.use(bodyParser.json());
app.use(express.urlencoded({extended: true})); //Review it
app.use(express.json({limit: "10kb"}));
app.use(cookieParser());

const corsOptions = {
    origin: ["https://ihtc.vercel.app", "https://ihtc-2q6h2anet-hosnyabdelfatahs-projects.vercel.app/", "http://localhost:3000"],
    credentials: true,
    optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "x-access-token, Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Credentials", true);
    res.setHeader("Access-Control-Max-Age", "1800");
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
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