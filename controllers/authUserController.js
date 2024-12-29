const {createHash} = require('crypto');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const sharp = require('sharp');
const User = require('../model/userModel');
const crypto = require('crypto');
const Email = require('../utils/email');
const filterBody = require('../helpers/filterBody');
const uuid = require('uuid');
const cloudinary = require('cloudinary').v2
const {Readable} = require('stream');
const userUniqueId = `E-${uuid.v4()}`;

const createToken = (id) => {
    return jwt.sign({id: id}, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    })
}
//////////////////////////////////////////////
const cookieToken = (name, token, req, res) => {
    res.cookie(name, token, {
        maxAge: 90 * 24 * 60 * 60 * 1000,
        secure: true,
        httpOnly: true,
        sameSite: "none"
    });
}

cloudinary.config({
    cloud_name: process.env.COUDINARY_CLOUD_NAME,
    api_key: process.env.COUDINARY_API_KEY,
    api_secret: process.env.COUDINARY_API_SECRET,
})
const upload = multer({storage: multer.memoryStorage()});
exports.uploadUserAvatar = upload.single('avatar')


///////////////////////// Multer
// const multerStorage = multer.diskStorage({
//
//     destination: (req, file, cb) => {
//         console.log("32" + req.file)
//         console.log("33" + JSON.stringify(file))
//         let userImageDir = '';
//
//         if (!fs.existsSync(`./public/images/users/${userUniqueId}`)) {
//             fs.mkdirSync(`./public/images/users/${userUniqueId}`, {recursive: true});
//             userImageDir = `./public/images/users/${userUniqueId}`
//         } else {
//             userImageDir = `./public/images/users/${userUniqueId}`
//         }
//         cb(null, userImageDir)
//     },
//     filename: (req, file, cb) => {
//         if (!req.body.email) {
//             console.log(`Email: ${req.body.email}`)
//             // return false;
//         }
//         const avatarName = `${userUniqueId}-avatar`
//         const fileName = file.originalname.slice(0, file.originalname.lastIndexOf('.'))
//         const ext = file.originalname.slice(file.originalname.lastIndexOf('.') + 1, file.originalname.length);
//         // console.log(fileName + "_" + Date.now() + "." + ext)
//         console.log(avatarName + "." + ext)
//         cb(null, avatarName + "." + ext);
//     }
// });
//
//
// const multerFilter = (req, file, cb) => {
//     if (file.mimetype.startsWith('image')) {
//         cb(null, true);
//     } else {
//         cb('Not an image! Please upload only image.', false);
//     }
// }


// const upload = multer({
//     storage: multerStorage,
//     fileFilter: multerFilter
// });

// exports.uploadUserAvatar = upload.single('avatar');
/////////////////////////

///////// Resize Avatar /////////
// exports.resizeImage = async (req, res, next) => {
//
//     if (!req.file) return next();
//     console.log(`Fileis: ${req.file.path}`);
//     await sharp(req.file.path)
//         .resize(300, 300)
//         .toFormat('webp')
//         .webp({quality: 90})
//         .toFile(`./public/images/users/${userUniqueId}/${userUniqueId}-avatar.webp`);
//
//     next();
// }
////////////////////////////////////////

exports.userSignUp = async (req, res) => {
    // console.log(req.file)
    console.log(req.body)
    try {
        const fileBuffer = req.file.buffer;
        const errMessages = [];
        let eMessages = ``;
        let avatar = ``;

        const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream((error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
            // Convert buffer to stream
            Readable.from(fileBuffer).pipe(stream);
        });

        const fileUrl = uploadResult.secure_url;
        console.log(`Avatar URL is: ${fileUrl}`);

        const userInfo = ["fname", "lname", "email", "password", "passwordConfirm",
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
            avatar = fileUrl;
        } else {
            avatar = `https://ihtc-backend.vercel.app/images/users/avatar.jpeg`;
        }

        const userRequest = filterBody(req.body, ...userInfo);

        const isExistsUser = await User.findOne({email})

        if (isExistsUser) return res.status(400).send(`User with Email ${email} is already exists! `);

        const newUser = await User.create({...userRequest, avatar, uniqueId: userUniqueId});

        const url = `${req.protocol}://${req.get('host')}`;

        const user = await User.findOne({uniqueId: userUniqueId}).populate([
            {path: "language", model: "Language"},
            {path: "country", model: "Country"},
            {path: "specialty", model: "DoctorSpecialty"}
        ]);

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET_KEY, {
            expiresIn: '90d',
        });

        user.tokens.push(token)
        console.log(`Token is: ${token}`)
        user.save({validateBeforeSave: false})

        cookieToken("userJwt", token, req, res);

        await new Email(newUser, url).sendWelcome();


        if (!user) return res.status(400).send('You are not logged in please login!');

        res.status(201).json({
            status: "Success",
            // data: user
            data: {
                fname: user.fname,
                lname: user.lname,
                specialty: user.specialty,
                title: user.jobTitle,
                country: user.country,
                language: user.language,
                description: user.description
            },
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

exports.activateUser = async (req, res) => {
    try {
        const id = req.params.userId;
        if (!id) return res.status(400).send('Please enter user id!');

        const activatedUser = await User.findByIdAndUpdate(id, {active: true});
        if (!activatedUser) return res.status(404).send('there is no user with this ID!');

        //:TODO Send Email to the user to tell it its account was  activated .

        res.status(201).send(`the user ${activatedUser.name} now is active user thank you`);
    } catch (err) {
        // console.log(err.message);
    }
}

//////////////////////////////////////////////
exports.userLogin = async (req, res) => {
    try {
        console.log(`${req.protocol}://${req.get('host')}`)
        const email = req.body.user;
        const password = req.body.password;

        if (!email || !password) return res.status(400).send('Please enter your user  and password');

        const user = await User.findOne({email})

        if (!user) return res.status(404).send('There is no user with this email!');


        // console.log(password, user.password)
        const rightPassword = await user.comparePasswords(password, user?.password)
        if (!rightPassword) return res.status(400).send('Email or password not correct');

        let token;
        if (user && rightPassword) {
            await user.populate([
                {path: "language", model: "Language"},
                {path: "country", model: "Country"},
                {path: "specialty", model: "DoctorSpecialty"}
            ]);

            if (!req.cookies['userJwt']) {
                // console.log('No userJwtCookie')
                token = jwt.sign({id: user.id}, process.env.JWT_SECRET_KEY, {
                    expiresIn: process.env.JWT_EXPIRES_IN,
                })

                // await cookieToken("userJwt", token, req, res);
                res.cookie("userJwt", token, {
                    maxAge: 90 * 24 * 60 * 60 * 1000,
                    secure: true,
                    httpOnly: true,
                    sameSite: "none",
                    path: "/"
                });
                0

                console.log(req.cookies["userJwt"])
                user.tokens.push(token);
                await user.save();
            } else {
                token = req.cookies['userJwt'];
                const tokenIsExists = user.tokens.indexOf(token)
                if (tokenIsExists === -1) {
                    user.tokens.push(token);
                    await user.save();
                }
            }

            const userData = {
                id: user?._id,
                firstName: user?.fname,
                lastName: user?.lname,
                profileImage: user?.avatar,
                country: user?.country.title,
                language: user?.language.title,
                specialty: user?.specialty.title,
                description: user?.description
            }

            res.status(200).json({
                status: "success",
                data: userData
            });
        } else {
            return res.status(401).send('Wrong email or password')
        }
    } catch (err) {
        res.send(err.message);
    }
}
//////////////////////////////////////////////

exports.userLogout = async (req, res, next) => {
    try {
        console.log(req.cookies.jwt)
        const currentToken = await req.cookies.jwt;

        if (!currentToken) {
            return res.status(401).send('You not logged in please login')
        }
        if (Object.keys(req.cookies).length <= 0) return res.status(401).send('You not logged in please login')

        const decoded = jwt.verify(currentToken, process.env.JWT_SECRETE_KEY)

        const currentUser = await User.findById(decoded.id);
        if (!currentUser) return res.status(401).send('The user belonging to this token does no longer exist.');

        if (currentUser.changedPasswordAfter(decoded.iat)) {
            return res.status(401).send('User recently changed password! Please log in again.');
        }
        currentUser.tokens = currentUser.tokens.filter(token => token !== currentToken);
        currentUser.save();

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

        const currentUser = await User.findById(decoded.id);
        if (!currentUser) return res.status(401).send('This user does not longer exists.');

        const isTokenActive = currentUser.tokens.find(isToken => isToken === token);
        if (!isTokenActive) return res.status(401).send('You are not logged in, please login');


        if (currentUser.changedPasswordAfter(decoded.iat)) {
            return res.status(401).send('User recently changed password! Please log in again.');
        }

        req.user = currentUser;
        res.locals.user = currentUser;
        next();
    } catch (err) {
        res.send(err.message);
    }
};
//////////////////////////////////////////////
exports.forgetPassword = async (req, res) => {
    const {email, url, useAs} = req.body;

    if (!email) return res.status(401).send('Please enter your email!');

    const user = await User.findOne({email});
    if (!user) return res.status(401).send('There is no user with this email!')

    try {
        const resetToken = user.createPasswordResetToken()
        console.log(`Reset token is: ${resetToken}`);
        await user.save({validateBeforeSave: false});

        await new Email(user, `${url}/reset-password?useAs=${useAs}&token=${resetToken}`).sendPasswordReset();

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!'
        });

    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({validateBeforeSave: false})
        res.send(err.message);
    }
}
//////////////////////////////////////////////
exports.resetPassword = async (req, res) => {
    try {
        const hashedToken = createHash('sha256').update(req.params.token).digest('hex');

        const user = await User.findOne({passwordResetToken: hashedToken, passwordResetExpires: {$gt: Date.now()}});
        // const user = await User.findOne({passwordResetToken: hashedToken});
        if (!user) return res.status(401).send('This url is expired!');

        const {url, newPassword, newPasswordConfirm} = req.body;
        if (!newPassword || !newPasswordConfirm) return res.status(401).send('Please write password  and confirm password !');
        if (newPassword !== newPasswordConfirm) return res.status(401).send('Confirm new password not match new password!');

        user.password = newPassword;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        const token = createToken(user.id)
        cookieToken("userJwt", token, req, res);

        await user.save();

        await new Email(doctor, `${url}/login`).sendResetSuccess();
        
        res.status(200).send('Successful reset password');
    } catch (err) {
        return res.send(err.message);
    }
}
//////////////////////////////////////////////
exports.updatePassword = async (req, res) => {
    try {
        const {id, currentPassword, newPassword, newPasswordConfirm} = req.body;
        const user = await User.findById(id);

        if (await user.comparePasswords(currentPassword, user.password)) {
            return res.status(401).send('Wrong current password!, please write correct current password.');
        }
        if (newPassword !== newPasswordConfirm) return res.status(401).send('New password not match confirm  new password!');

        user.password = newPassword;
        await user.save({validateBeforeSave: true, new: true});

        const token = createToken(user._id);
        cookieToken("userJwt", token, req, res);

        res.status(200).json({
            message: 'Password update successful'
        });

    } catch (err) {
        console.log(err)
        return res.status(500).send(err.message)
    }
}

exports.updateAvatar = async (req, res) => {
    try {
        const id = req.params.id
        if (!id) return res.status(400).send('You are not logged id, please log in.');

        const fileBuffer = req.file.buffer;

        let avatar = ``;

        const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream((error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
            // Convert buffer to stream
            Readable.from(fileBuffer).pipe(stream);
        });

        const fileUrl = uploadResult.secure_url;
        console.log(`Avatar URL is: ${fileUrl}`);

        const currentUser = await User.findById(id);
        if (!currentUser) return res.status(404).send('There is no user with this id, please log in');

        console.log(currentUser);

        if (req.file) {
            avatar = fileUrl;
        } else {
            avatar = currentUser.avatar;
        }

        currentUser.avatar = avatar;
        await currentUser.save({validateBeforeSave: true, new: true});

        res.status(200).json({
            status: 'success',
            data: currentUser
        });

    } catch (err) {
        console.log(err);
        res.status(500).send(err.message);
    }
}

exports.agreeRole = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).send('You have not permission to enter this page!');
        }
        next();
    }
}
