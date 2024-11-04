const jwt = require('jsonwebtoken');
const multer = require("multer");
const sharp = require("sharp");
const crypto = require('crypto');
const Organization = require("../model/organizationModel");
const Email = require('../utils/email');
const filterBody = require('../helpers/filterBody');
const fs = require("fs");
const uuid = require("uuid");

const organizationUniqueId = `E-${uuid.v4()}`;

//////////////////////////////////////////////
const createToken = (id) => {
    return jwt.sign(
        {id: id}, process.env.JWT_SECRET_KEY,
        {expiresIn: '90d'}, function (err, token) {
            console.log(token);
        }
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
//////////////////////////////////////////////


//////??????????????????????????????????????????
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let organizationImageDir = '';
        if (!fs.existsSync(`./public/images/organizations/${organizationUniqueId}`)) {
            fs.mkdirSync(`./public/images/organizations/${organizationUniqueId}`);
            organizationImageDir = `./public/images/organizations/${organizationUniqueId}`
        } else {
            organizationImageDir = `./public/images/organizations/${organizationUniqueId}`
        }
        cb(null, organizationImageDir)
    },
    filename: (req, file, cb) => {
        const fileName = `${req.body.email}-logo`
        const ext = file.originalname.slice(file.originalname.lastIndexOf('.') + 1, file.originalname.length);
        console.log(fileName + '.' + ext)
        cb(null, fileName + '.' + ext);
    }
})

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb('Not an image! Please upload only image.', false);
    }
}
//
const upload = multer({
    storage: storage,
    fileFilter: multerFilter
});

exports.uploadOrganizationImages = upload.fields(
    [{name: 'logo', maxCount: 1}, {name: 'banner', maxCount: 1}]
);
// exports.uploadOrganizationBanner = upload.single('banner');
/////////////////////////

///////// Resize Avatar /////////
exports.resizeImage = async (req, res, next) => {
    // console.log(`File is: ${req.file}`);
    if (!req.file) return next();

    const namedFile = req.body.email;
    if (!namedFile) return res.status(404).send('Select category to update its image or write  category English name!');


    await sharp(req.file.buffer)
        .resize(300, 300)
        .toFormat('webp')
        .webp({quality: 90})
        .toFile(`./public/images/organization/${organizationUniqueId}/${namedFile.toLowerCase()}-logo.webp`);

    next();
}
////////////////////////////////////////

exports.organizationSignup = async (req, res) => {
    try {
        let logo = ``;
        const errMessages = [];
        let eMessages = ``;
        const organizationInfo = ["name", "email", "password", "passwordConfirm", "phone", "mobile", "logo", "banner", "description", "industryField", "country"];
        const {
            name, email, password, passwordConfirm, phone, mobile,
            description, industryField, country
        } = req.body;

        if (!name) errMessages.push('You must enter your name!');
        if (!email) errMessages.push('You must enter your email!');
        if (!password) errMessages.push('You must enter your password!');
        if (!passwordConfirm) errMessages.push('You must confirm your password!');
        if (!phone) errMessages.push('You must enter your phone!');
        if (!mobile) errMessages.push('You must enter your mobile!');
        // if (!logo) errMessages.push('You must enter your logo!');
        if (!description) errMessages.push('You must enter your description!');
        if (!industryField) errMessages.push('You must enter your industryField!');
        if (!country) errMessages.push('You must enter your country!');

        if (errMessages.length > 0) {
            errMessages.forEach(message => eMessages += `${message}\n`);
            return res.status(400).send(eMessages);
        }

        const organizationRequest = filterBody(req.body, ...organizationInfo);

        logo = `${req.protocol}://${req.get('host')}/images/organizations/${organizationUniqueId}/${email.toLowerCase()}-logo.webp`;

        const banner = `./images/organizations/${organizationUniqueId}/${email.toLowerCase()}-banner.webp`;

        const newOrganization = await Organization.create({
            ...organizationRequest,
            logo,
            uniqueId: organizationUniqueId
        });

        const token = createToken(newOrganization._id)
        // console.log(token);
        const url = `${req.protocol}://${req.get('host')}`;
        // console.log(url);
        await new Email(newOrganization, url).sendWelcome();
        newOrganization.tokens.push(token);
        newOrganization.save();

        cookieToken("organizationJwt", token, req, res);


        res.status(201).json({
            status: "Success",
            token,
            organization: newOrganization.name,
        });
    } catch (err) {
        console.log(err.message)
    }
}
//////////////////////////////////////////////

exports.activateOrganization = async (req, res) => {
    try {
        const id = req.params.organizationId;
        if (!id) return res.status(400).send('Please enter organization id!');

        const activatedOrganization = await Organization.findByIdAndUpdate(id, {active: true}, {new: true});
        if (!activatedOrganization) return res.status(404).send('there is no organization with this ID!');

        //:TODO Send Email to the organization to tell it its account was  activated .

        res.status(201).send(`the organization ${activatedOrganization.name} now is active organization thank you`);
    } catch (err) {
        console.log(err.message);
    }
}

//////////////////////////////////////////////
exports.organizationLogin = async (req, res) => {
    console.log(req.body)
    const {user, password} = req.body;
    if (!user || !password) return res.status(400).send('Please enter your email and password');
    // console.log(req.cookies['organizationJwt']);
    try {

        const organization = await Organization.findOne({email: user})
            .populate({path: 'country', model: "Country", select: " -_id"});
        if (!organization) return res.status(404).send('There is no organization with this email!');

        const rightPassword = await organization.correctPassword(password, organization.password)
        if (!rightPassword) return res.status(400).send('Email or password not correct');

        let token;
        if (organization && rightPassword) {
            if (!req.cookies['organizationJwt']) {
                token = createToken(organization._id)
                cookieToken("organizationJwt", token, req, res);
                console.log(token)
                organization.tokens.push(token);
                await organization.save();
            } else {

                token = req.cookies['organizationJwt'];
                const tokenIsExists = organization.tokens.indexOf(token)
                if (tokenIsExists === -1) {
                    organization.tokens.push(token);
                    await organization.save();
                }
            }

            const {name, logo, banner, description, country, language, _id, uniqueId} = organization;

            res.json({
                organization: {name, logo, banner, description, country, language, _id, uniqueId},
                token: token
            });
        } else {
            return res.status(401).send('Wrong email or password')
        }
    } catch (err) {
        res.send(err.message);
    }
}
//////////////////////////////////////////////
exports.logout = async (req, res, next) => {
    try {
        console.log(req.cookies.organizationJwt)
        const currentToken = await req.cookies.organizationJwt;

        if (!currentToken) {
            return res.status(401).send('You not logged in please login')
        }
        if (Object.keys(req.cookies).length <= 0) return res.status(401).send('You not logged in please login')

        const decoded = jwt.verify(currentToken, process.env.JWT_SECRETE_KEY)

        const currentOrganization = await Organization.findById(decoded.id);
        if (!currentOrganization) return res.status(401).send('The organization belonging to this token does no longer exist.');

        if (currentOrganization.changedPasswordAfter(decoded.iat)) {
            return res.status(401).send('Organization recently changed password! Please log in again.');
        }
        currentOrganization.tokens = currentOrganization.tokens.filter(token => token !== currentToken);
        currentOrganization.save();


        await res.cookie('organizationJwt', 'logged out', {
            expires: new Date(Date.now() + 10),
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
        } else if (req.cookies.organizationJwt) {
            token = await req.cookies.organizationJwt;
        }

        if (!token) {
            return res.status(401).send('You not logged in please login')
        }
        if (Object.keys(req.cookies).length <= 0) return res.status(401).send('You not logged in please login')
        const decoded = jwt.verify(token, process.env.JWT_SECRETE_KEY)

        const currentOrganization = await Organization.findById(decoded.id);
        if (!currentOrganization) return res.status(401).send('The organization belonging to this token does no longer exist.');

        if (currentOrganization.changedPasswordAfter(decoded.iat)) {
            return res.status(401).send('Organization recently changed password! Please log in again.');
        }

        req.organization = currentOrganization;
        res.locals.organization = currentOrganization;
        next();
    } catch (err) {
        res.send(err.message);
    }
};
//////////////////////////////////////////////
exports.forgetPassword = async (req, res) => {
    const email = req.body.email;
    if (!email) return res.status(401).send('Please enter your email!');

    const organization = await Organization.findOne({email});
    if (!organization) return res.status(401).send('There is no organization with this email!')

    try {
        const resetToken = organization.crateResetToken();
        await organization.save({validateBeforeSave: false});
        res.status(200).send(await resetToken);

    } catch (err) {
        organization.passwordResetToken = undefined;
        organization.passwordResetExpires = undefined;
        await organization.save({validateBeforeSave: false})
        res.send(err.message);
    }
}
//////////////////////////////////////////////

exports.resetPassword = async (req, res) => {
    try {
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        // const organization = await Organization.findOne({ passwordResetToken: hashedToken,  passwordResetExpires: { $gt: Date.now() } });
        const organization = await Organization.findOne({passwordResetToken: hashedToken});
        if (!organization) return res.status(401).send('This url is expired!');

        const {newPassword, confirmNewPassword} = req.body;
        if (!newPassword || !confirmNewPassword) return res.status(401).send('Please write password  and confirm password !');
        if (newPassword !== confirmNewPassword) return res.status(401).send('Confirm new password not match new password!');

        organization.password = newPassword;
        organization.passwordResetToken = undefined;
        organization.passwordResetExpires = undefined;

        const token = createToken(organization.id)
        cookieToken("organizationJwt", token, req, res);

        await organization.save();
        res.status(200).send('Successful reset password');
    } catch (err) {
        return res.send(err.message);
    }
}

//////////////////////////////////////////////

exports.updatePassword = async (req, res) => {
    try {
        const {currentPassword, newPassword, confirmNewPassword} = req.body;
        const organization = await Organization.findById(req.organization.id);

        if (await organization.comparePassword(currentPassword, organization.password)) {
            if (newPassword !== confirmNewPassword) return res.status(401).send('New password not match confirm  new password!');

            organization.password = newPassword;
            organization.save({validateBeforeSave: true, new: true});

            const token = createToken(organization._id);
            cookieToken("organizationJwt", token, req, res);

            res.status(200).json({
                message: 'Password update successful'
            });
        }
    } catch (err) {
        return console.log(err.message)
    }
}


exports.agreeRole = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.organization.role)) {
            return res.status(403).send('You have not permission to enter this page!');
        }
        next();
    }
}
