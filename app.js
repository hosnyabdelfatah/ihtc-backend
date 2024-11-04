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


const corsOptions = {
    origin: ["http://localhost:3000", "https://ihtc.vercel.app", "https://ihtc-q2teign6e-hosnyabdelfatahs-projects.vercel.app/"], // List specific origins only
    credentials: true, // Allows cookies and credentials
    exposedHeaders: ['Set-Cookie', 'Date', 'ETag'], // Headers you want exposed to the client
    optionsSuccessStatus: 200 // For legacy browsers (optional)
};

app.use(cors(corsOptions)); // Apply CORS with specified options

//Middleware
app.use(bodyParser.urlencoded({extended: false})) //Review it
app.use(bodyParser.json());
app.use(express.urlencoded({extended: true})); //Review it
app.use(express.json({limit: "10kb"}));
app.use(cookieParser());

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