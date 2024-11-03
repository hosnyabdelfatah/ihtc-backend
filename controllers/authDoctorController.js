const jwt = require('jsonwebtoken');
const multer = require('multer');
const sharp = require('sharp');
const Doctor = require('../model/doctorModel');
const crypto = require('crypto');
const Email = require('../utils/email');
const filterBody = require('../helpers/filterBody');
const uuid = require('uuid');


const createToken = (id) => {
    return jwt.sign(
        {id: id}, process.env.JWT_SECRETE_KEY,
        {expiresIn: '90d'}
    )
}
//////////////////////////////////////////////
const cookieToken = (name, token, req, res) => {
    res.cookie(name, token, {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        maxAge: 90 * 24 * 60 * 60 * 1000,
        secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
        httpOnly: true
    });
}

///////////////////////// Multer
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb('Not an image! Please upload only image.', false);
    }
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

exports.uploadDoctorImage = upload.single('avatar');
/////////////////////////

///////// Resize Avater /////////
exports.resizeImage = async (req, res, next) => {
    // console.log(`Fileis: ${req.file}`);
    if (!req.file) return next();

    const namedFile = req.body.email;
    if (!namedFile) return res.status(404).send('Select category to update its image or write  category English name!');


    await sharp(req.file.buffer)
        .resize(300, 300)
        .toFormat('webp')
        .webp({quality: 90})
        .toFile(`./public/images/doctor/${namedFile.toLowerCase()}.webp`);

    next();
}
////////////////////////////////////////

exports.signUp = async (req, res) => {

    try {
        const errMessages = [];
        let eMessages = ``;
        let image = ``;

        const doctorInfo = ["fname", "lname", "email", "password", "passwordConfirm",
            "whatsapp", "description", "workPlace", "facebookId", "specialty",
            "language", "jobTitle", "country"
        ];
        const {
            fname, lname, email, password, passwordConfirm, whatsapp, description,
            workPlace, facebookId, specialty, language, jobTitle, country
        } = req.body;

        if (!fname) errMessages.push('You must enter your first name!');
        if (!lname) errMessages.push('You must enter your last name!');
        if (!email) errMessages.push('You must enter your email!');
        if (!password) errMessages.push('You must enter your password!');
        if (!passwordConfirm) errMessages.push('You must enter your password confirm!');
        if (password !== passwordConfirm) errMessages.push('Password and password confirm not match!');
        if (!whatsapp) errMessages.push('Whatsapp number is require!');
        if (!specialty) errMessages.push('Specialty number is require!');
        if (!country) errMessages.push('Country number is require!')

        if (errMessages.length > 0) {
            errMessages.forEach(message => eMessages += `${message}\n`);
            return res.status(400).send(eMessages);
        }
        if (req.file) {
            image = `${req.protocol}://${req.get('host')}/images/doctor/${email.toLowerCase()}.webp`;
        } else {
            image = `${req.protocol}://${req.get('host')}/images/doctor/avatar.jpeg`;
        }

        const doctorRequest = filterBody(req.body, ...doctorInfo);
        // console.log(doctorRequest)
        const newDoctor = await Doctor.create({...doctorRequest, image, uniqueId: `D-${uuid.v4()}`});

        const token = createToken(newDoctor._id);

        newDoctor.tokens.push(token);
        newDoctor.save();

        const url = `${req.protocol}://${req.get('host')}`;


        cookieToken("doctorJwt", token, req, res);

        //TODO SEND EMAIL TO THE Doctor
        // console.log(`URL: ${url}`);
        await new Email(newDoctor, url).sendWelcome();

        res.status(201).json({
            status: "Success",
            data: newDoctor.fname,
        });
    } catch (err) {
        // console.log(err.message)
        res.status(500).send(err.message);
    }
}
//////////////////////////////////////////////

exports.activateDoctor = async (req, res) => {
    try {
        const id = req.params.doctorId;
        if (!id) return res.status(400).send('Please enter doctor id!');

        const activatedUser = await Doctor.findByIdAndUpdate(id, {active: true});
        if (!activatedUser) return res.status(404).send('there is no doctor with this ID!');

        //:TODO Send Email to the doctor to tell it its account was  activated .

        res.status(201).send(`the doctor ${activatedUser.name} now is active doctor thank you`);
    } catch (err) {
        // console.log(err.message);
    }
}

//////////////////////////////////////////////
exports.doctorLogin = async (req, res) => {
    console.log(`REQUEST BODY IS: ${req.user}`)
    const {user, password} = req.body;
    if (!user || !password) return res.status(400).send('Please enter your user  and password');
    // console.log(req.cookies['jwt']);
    // if (user.startsWith('D-'))
    console.log(`USER PASSWORD IS:  ${user.password}`)
    try {
        const doctor = await Doctor.findOne({user}).exec();
        if (!doctor) return res.status(404).send('There is no doctor with this email!');

        const rightPassword = await doctor.correctPassword(password, doctor.password)
        if (!rightPassword) return res.status(400).send('Email or password not correct');


        if (doctor && rightPassword) {
            if (!req.cookies['jwt']) {
                const token = createToken(doctor._id)
                cookieToken("doctorJwt", token, req, res);
                doctor.tokens.push(token);
                doctor.save();
            }

            res.json({
                doctor: doctor.fname
            });
        } else {
            return res.status(401).send('Wrong email or password')
        }
    } catch (err) {
        res.send(err.message);
    }
}
//////////////////////////////////////////////
exports.doctorLogout = async (req, res, next) => {
    try {
        console.log(req.cookies.jwt)
        const currentToken = await req.cookies.jwt;

        if (!currentToken) {
            return res.status(401).send('You not logged in please login')
        }
        if (Object.keys(req.cookies).length <= 0) return res.status(401).send('You not logged in please login')

        const decoded = jwt.verify(currentToken, process.env.JWT_SECRETE_KEY)

        const currentDoctor = await Doctor.findById(decoded.id);
        if (!currentDoctor) return res.status(401).send('The doctor belonging to this token does no longer exist.');

        if (currentDoctor.changedPasswordAfter(decoded.iat)) {
            return res.status(401).send('Doctor recently changed password! Please log in again.');
        }
        currentDoctor.tokens = currentDoctor.tokens.filter(token => token !== currentToken);
        currentDoctor.save();

        await res.cookie('jwt', 'logged out', {
            expires: new Date(Date.now() + 1),
            httpOnly: true,
        });
        res.send("We will wait you again!");
        next();
    } catch (err) {
        res.send(err.message);
    }
}

exports.isLoggedIn = async (req, res, next) => {
    try {
        let token;
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];
        } else if (req.cookies.jwt) {
            token = await req.cookies.jwt;
        }

        if (!token) {
            return res.status(401).send('You not logged in please login')
        }
        if (Object.keys(req.cookies).length <= 0) return res.status(401).send('You not logged in please login')

        const decoded = jwt.verify(token, process.env.JWT_SECRETE_KEY)

        const currentDoctor = await Doctor.findById(decoded.id);
        if (!currentDoctor) return res.status(401).send('This doctor does not longer exists.');

        const isTokenActive = currentDoctor.tokens.find(isToken => isToken === token);
        if (!isTokenActive) return res.status(401).send('You are not logged in, please login');


        if (currentDoctor.changedPasswordAfter(decoded.iat)) {
            return res.status(401).send('Doctor recently changed password! Please log in again.');
        }

        req.doctor = currentDoctor;
        res.locals.doctor = currentDoctor;
        next();
    } catch (err) {
        res.send(err.message);
    }
};
//////////////////////////////////////////////
exports.forgetPassword = async (req, res) => {
    const email = req.body.email;
    if (!email) return res.status(401).send('Please enter your email!');

    const doctor = await Doctor.findOne({email});
    if (!doctor) return res.status(401).send('There is no doctor with this email!')

    try {
        const resetToken = doctor.crateResetToken();
        await doctor.save({validateBeforeSave: false});
        res.status(200).send(await resetToken);

    } catch (err) {
        doctor.passwordResetToken = undefined;
        doctor.passwordResetExpires = undefined;
        await doctor.save({validateBeforeSave: false})
        res.send(err.message);
    }
}
//////////////////////////////////////////////
exports.resetPassword = async (req, res) => {
    try {
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        const doctor = await Doctor.findOne({passwordResetToken: hashedToken, passwordResetExpires: {$gt: Date.now()}});
        // const doctor = await Doctor.findOne({passwordResetToken: hashedToken});
        if (!doctor) return res.status(401).send('This url is expired!');

        const {newPassword, confirmNewPassword} = req.body;
        if (!newPassword || !confirmNewPassword) return res.status(401).send('Please write password  and confirm password !');
        if (newPassword !== confirmNewPassword) return res.status(401).send('Confirm new password not match new password!');

        doctor.password = newPassword;
        doctor.passwordResetToken = undefined;
        doctor.passwordResetExpires = undefined;

        const token = createToken(doctor.id)
        cookieToken("doctorJwt", token, req, res);

        await doctor.save();
        res.status(200).send('Successful reset password');
    } catch (err) {
        return res.send(err.message);
    }
}
//////////////////////////////////////////////
exports.updatePassword = async (req, res) => {
    try {
        const {currentPassword, newPassword, confirmNewPassword} = req.body;
        const doctor = await Doctor.findById(req.doctor.id);

        if (await doctor.comparePassword(currentPassword, v.password)) {
            if (newPassword !== confirmNewPassword) return res.status(401).send('New password not match confirm  new password!');

            doctor.password = newPassword;
            doctor.save({validateBeforeSave: true, new: true});

            const token = createToken(doctor._id);
            cookieToken("doctorJwt", token, req, res);

            res.status(200).json({
                message: 'Password update successful'
            });
        }
    } catch (err) {
        console.log(err)
        return res.status(500).send(err.message)
    }
}


exports.agreeRole = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.doctor.role)) {
            return res.status(403).send('You have not permission to enter this page!');
        }
        next();
    }
}
