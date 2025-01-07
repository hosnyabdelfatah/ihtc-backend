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
const userRoutes = require('./routes/userRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const doctorMessageRoutes = require('./routes/doctorMessageRoutes');

const app = express();

const allowedOrigins = [
    "https://ihtc-frontend-91jzowe1g-hosnyabdelfatahs-projects.vercel.app/",
    "https://ihtc-frontend-91jzowe1g-hosnyabdelfatahs-projects.vercel.app/",
    "https://ihtc-frontend.vercel.app",
    "https://ihtc-backend.vercel.app/languages",
    "https://ihtc-backend.vercel.app/specialties",
    "https://ihtc-backend.vercel.app/countries/",
    "http://localhost:3000"
]


const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // Allow credentials like cookies
    optionsSuccessStatus: 200, // For legacy browsers
    allowedHeaders: 'Content-Type,Authorization,Cookie', // Allowed headers
};

// Apply CORS middleware globally
app.use(cors(corsOptions));

// Handle preflight requests globally
app.options('*', cors(corsOptions));

// Referrer Policy Middleware (optional)
app.use((req, res, next) => {
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
});
app.use(morgan('tiny'));

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.set('trust proxy', 1);
app.use(express.static(path.join(__dirname, `public`)));


//Middleware
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json());
app.use(express.urlencoded({extended: true}));
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
app.use('/users', userRoutes);
app.use('/campaigns', campaignRoutes);
app.use('/doctor-messages', doctorMessageRoutes);

module.exports = app;