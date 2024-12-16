const jwt = require('jsonwebtoken');
const {promisify} = require('util');
const multer = require('multer');
// const sharp = require('sharp');
const cloudinary = require('cloudinary').v2
const {Readable} = require('stream');
const Doctor = require('../model/doctorModel');
const bcrypt = require('bcrypt');
const {createHash} = require('crypto');
const Email = require('../utils/email');
const filterBody = require('../helpers/filterBody');
const uuid = require('uuid');
const fs = require("fs");

const doctorUniqueId = `E-${uuid.v4()}`;

const createToken = (id) => {
    return jwt.sign({id: id}, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    })
}
//////////////////////////////////////////////
const cookieToken = (name, token, req, res) => {
    res.cookie(name, token, {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        maxAge: 90 * 24 * 60 * 60 * 1000,
        secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
        httpOnly: true,
        SameSite: "none"
    });
}

///////////////////////// Multer
// const multerStorage = multer.diskStorage({
//
//     destination: (req, file, cb) => {
//         console.log("32" + req.file)
//         console.log("33" + file)
//         let doctorImageDir = '';
//
//         if (!fs.existsSync(`./public/images/doctor/${doctorUniqueId}`)) {
//             fs.mkdirSync(`./public/images/doctor/${doctorUniqueId}`);
//             doctorImageDir = `./public/images/doctor/${doctorUniqueId}`
//         } else {
//             doctorImageDir = `./public/images/doctor/${doctorUniqueId}`
//         }
//         cb(null, doctorImageDir)
//     },
//     filename: (req, file, cb) => {
//         const fileName = file.originalname.slice(0, file.originalname.lastIndexOf('.'))
//         const ext = file.originalname.slice(file.originalname.lastIndexOf('.') + 1, file.originalname.length);
//         console.log(fileName + "_" + Date.now() + "." + ext)
//         cb(null, doctorUniqueId + "." + ext);
//     }
// });

cloudinary.config({
    cloud_name: process.env.COUDINARY_CLOUD_NAME,
    api_key: process.env.COUDINARY_API_KEY,
    api_secret: process.env.COUDINARY_API_SECRET,
})


const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb('Not an image! Please upload only image.', false);
    }
}

const upload = multer({
    storage: multer.memoryStorage,
    fileFilter: multerFilter
});

exports.uploadDoctorImage = upload.single('image');
/////////////////////////

///////// Resize Avatar /////////
// exports.resizeImage = async (req, res, next) => {
//     // console.log(`Fileis: ${req.file}`);
//     if (!req.file) return next();
//
//     const namedFile = req.body.email;
//     if (!namedFile) return res.status(404).send('Select category to update its image or write  category English name!');
//
//
//     await sharp(req.file.buffer)
//         .resize(300, 300)
//         .toFormat('webp')
//         .webp({quality: 90})
//         .toFile(`./public/images/doctor/${doctorUniqueId.toLowerCase()}.webp`);
//
//     next();
// }
////////////////////////////////////////

exports.doctorSignUp = async (req, res) => {
    try {
        const fileBuffer = req.file.buffer;
        const errMessages = [];
        let eMessages = ``;
        let image = ``;

        const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream((error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
            // Convert buffer to stream
            Readable.from(fileBuffer).pipe(stream);
        });

        const fileUrl = uploadResult.secure_url;

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
            image = fileUrl;
        } else {
            image = `https://res.cloudinary.com/dq8h1tfis/image/upload/v1732632603/ihtc/mte8snmyiarpvfhofp6k.jpg`;
        }

        const doctorRequest = filterBody(req.body, ...doctorInfo);

        const isExistsDoctor = await Doctor.findOne({email})

        if (isExistsDoctor) return res.status(400).send(`Doctor with Email ${email} is already exists! `)

        const newDoctor = await Doctor.create({
            ...doctorRequest, image,
            uniqueId: `D-${doctorUniqueId}`
        });

        const token = jwt.sign({id: newDoctor._id}, process.env.JWT_SECRET_KEY,
            {expiresIn: process.env.JWT_EXPIRES_IN,}
        );

        newDoctor.tokens.push(token);
        newDoctor.save();

        const url = `${req.protocol}://${req.get('host')}`;


        cookieToken("doctorJwt", token, req, res);

        await new Email(newDoctor, url).sendWelcome();

        res.status(201).json({
            status: "Success",
            data: newDoctor.fname,
        });
    } catch (err) {
        console.log(JSON.stringify(err.message))
        if (err.code === 11000) {
            res.status(400).json({
                code: err.code,
                message: `Duplicate field :  ${JSON.stringify(Object.keys(err.keyValue)[0])} value. Please use another value!`
            })
        } else
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

    const {user, password} = req.body;
    if (!user || !password) return res.status(400).send('Please enter your user  and password');

    try {
        let doctor
        if (user.startsWith('D-'))
            doctor = await Doctor.findOne({uniqueId: user.trim(0)}).exec();
        else if (user.indexOf('@') !== -1)
            doctor = await Doctor.findOne({email: user.trim()});

        if (!doctor) return res.status(404).send('There is no doctor with this email!');

        const rightPassword = await doctor.correctPassword(password, doctor.password)
        if (!rightPassword) return res.status(400).send('Email or password not correct');


        if (doctor && rightPassword) {
            await doctor.populate([
                {path: "language", model: "Language", select: "title"},
                {path: "country", model: "Country", select: "title"},
                {
                    path: "specialty",
                    model: "DoctorSpecialty",
                    select: "title"
                }
            ]);
            let token
            if (!req.cookies['doctorJwt']) {
                token = jwt.sign({id: doctor.id}, process.env.JWT_SECRET_KEY, {
                    expiresIn: process.env.JWT_EXPIRES_IN,
                })
                // console.log("JWT_EXPIRES_IN:", process.env.JWT_EXPIRES_IN);
                cookieToken("doctorJwt", token, req, res);

                doctor.tokens.push(token);
                await doctor.save();
            } else {
                token = req.cookies['doctorJwt'];
                const tokenIsExists = doctor.tokens.indexOf(token)
                if (tokenIsExists === -1) {
                    doctor.tokens.push(token);
                    await doctor.save();
                }
            }

            res.status(200).json({
                status: "success",
                data: {
                    uniqueId: doctorUniqueId,
                    id: doctor._id,
                    firstName: doctor.fname,
                    lastName: doctor.lname,
                    profileImage: doctor.image,
                    country: doctor.country.title,
                    specialty: doctor.specialty.title,
                    language: doctor.language.title,
                    description: doctor.description,
                }
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
        console.log(req.cookies.doctorJwt)
        const currentToken = await req.cookies.doctorJwt;

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

        await res.cookie('doctorJwt', 'logged out', {
            expires: new Date(Date.now() + 1),
            httpOnly: true,
        });
        res.send("We will wait you again!");
        next();
    } catch (err) {
        res.send(err.message);
    }
}


exports.forgetPassword = async (req, res) => {

    const {email, url, useAs} = req.body;
    if (!email) return res.status(401).send('Please enter your email!');

    const doctor = await Doctor.findOne({email});
    if (!doctor) return res.status(401).send('There is no doctor with this email!')

    try {
        const resetToken = doctor.createPasswordResetToken();

        await doctor.save({validateBeforeSave: false});

        const resetURL = `${req.protocol}://${req.get(
            'host'
        )}/doctors/resetPassword/${resetToken}`;

        const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.
                   if you didn't forgot your password please ignore this email!`;

        await new Email(doctor, `${url}/reset-password?useAs=${useAs}&token=${resetToken}`).sendPasswordReset();


        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!'
        });
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
        const hashedToken = createHash('sha256').update(req.params.token).digest('hex');

        const doctor = await Doctor.findOne({passwordResetToken: hashedToken, passwordResetExpires: {$gt: Date.now()}});

        if (!doctor) return res.status(401).send('This url is expired!');

        const {newPassword, newPasswordConfirm} = req.body;
        if (!newPassword || !newPasswordConfirm) return res.status(401).send('Please write password  and confirm password !');
        if (newPassword !== newPasswordConfirm) return res.status(401).send('Confirm new password not match new password!');

        doctor.password = newPassword;
        doctor.passwordResetToken = undefined;
        doctor.passwordResetExpires = undefined;

        // createToken(doctor.id)
        const token = jwt.sign({id: doctor.id}, process.env.JWT_SECRET_KEY, {
            expiresIn: process.env.JWT_EXPIRES_IN,
        })
        cookieToken("doctorJwt", token, req, res);

        await doctor.save();
        res.status(200).send('Successful reset password');
    } catch (err) {
        return res.send(err.message);
    }
}
//////////////////////////////////////////////

exports.isLoggedIn = async (req, res, next) => {
    console.log('DEBUG HEADERS: ', res.getHeaders());
    try {

        let token;
        if (Object.keys(req.cookies).length <= 0) return res.status(401).send('You not logged in please login');

        if (await req.cookies["doctorJwt"]) {
            token = await req.cookies["doctorJwt"];

        }

        if (!token) {
            return res.status(401).send('You not logged in please login')
        }

        // const decoded = await promisify(jwt.verify(token, process.env.JWT_SECRET_KEY));
        let id;
        let iat;
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY, function (err, decoded) {

            id = decoded.id;
            iat = decoded.iat
            if (err) console.log(err)
        });


        const currentDoctor = await Doctor.findById(id);
        if (!currentDoctor) return res.status(401).send('This doctor does not longer exists.');


        const isTokenActive = currentDoctor.tokens.find(isToken => isToken === token);

        if (!isTokenActive) return res.status(401).send('You are not logged in, please login');


        if (currentDoctor.changedPasswordAfter(iat)) {
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
exports.updatePassword = async (req, res) => {
    try {


        const {id, currentPassword, newPassword, newPasswordConfirm} = req.body;
        const doctor = await Doctor.findById(id);

        if (await doctor.correctPassword(currentPassword, doctor.password)) {

            if (newPassword.trim() !== newPasswordConfirm.trim()) return res.status(401).send('New password not match  new password  confirm!');

            doctor.password = newPassword;
            await doctor.save({validateBeforeSave: true, new: true});

            const token = jwt.sign({id: doctorId}, process.env.JWT_SECRET_KEY, {
                expiresIn: process.env.JWT_EXPIRES_IN,
            });

            cookieToken("doctorJwt", token, req, res);

            doctor.tokens.push(token);
            await doctor.save();

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

exports.updateProfileImage = async (req, res) => {
//    :TODO Create update profile image
}
