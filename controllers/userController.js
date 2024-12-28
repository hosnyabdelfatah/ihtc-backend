const User = require('../model/userModel');
const filterBody = require("../helpers/filterBody");

exports.getAllUsers = async (req, res) => {
    try {
        let filter = {};
        const page = parseInt(req.query.page) || 1;
        const limit = req.query.limit || 20;

        const {country, specialty} = req.query;

        filter = country ? {...filter, country} : {};
        filter = specialty ? {...filter, specialty} : {...filter};

        console.log(filter)

        const startIndex = (page - 1) * limit;

        const totalDocs = await User.countDocuments();
        const totalPages = Math.ceil(totalDocs / limit);

        const allUsers = await User.find(filter).skip(startIndex).limit(limit)
            .populate([
                {path: "language", model: "Language", select: "title -_id "},
                {path: "country", model: "Country", select: "title -_id"},
                {
                    path: "specialty",
                    model: "DoctorSpecialty",
                    select: "title -_id"
                }
            ]);

        const totalCurrentSearchUsersPages = Math.ceil(allUsers.length / limit)
        const pages = !country && !specialty ? totalPages : totalCurrentSearchUsersPages;
        // console.log(`${allUsers.length} / ${limit}`)

        res.status(200).json({
            count: allUsers.length,
            currentPage: page,
            pages,
            totalItems: totalDocs,
            data: allUsers,
        });
    } catch (err) {
        console.log('Error fetching user:', err);
        res.status(500).send(err.message);
    }
}

exports.userGetMe = async (req, res) => {
    // const user = req.user;
    try {
        const id = req.params.id
        if (!id) return res.status(400).send('You are not logged in!, please log in');

        const me = await User.findById(id);
        if (!me) return res.status(404).send('There is no user with this ID!, please log in again');

        await me.populate([
            {path: "language", model: "Language"},
            {path: "country", model: "Country"},
            {path: "specialty", model: "DoctorSpecialty"}
        ]);

        res.status(200).json({
            status: 'success',
            data: me
        })
    } catch (err) {
        console.log(err);
        res.status(500).send(err.message);
    }
};

exports.userUpdateMe = async (req, res) => {
    try {
        const errMessages = [];
        let eMessages = ``;

        const id = req.params.id;
        if (!id) return res.status(400).send('You are not logged in!, please log in');

        const userInfo = ["fname", "lname", "email", "whatsapp", "description", "workPlace", "facebookId", "specialty", "language", "jobTitle", "country"];

        const {
            fname, lname, email, whatsapp, description,
            workPlace, facebookId, specialty, language, jobTitle, country
        } = req.body;

        if (!fname) errMessages.push('You must enter your first name!');
        if (!lname) errMessages.push('You must enter your last name!');
        if (!email) errMessages.push('You must enter your email!');
        if (!whatsapp) errMessages.push('Whatsapp number is require!');
        if (!specialty) errMessages.push('Specialty number is require!');
        if (!country) errMessages.push('Country number is require!')

        if (errMessages.length > 0) {
            errMessages.forEach(message => eMessages += `${message}\n`);
            return res.status(400).send(eMessages);
        }

        const userRequest = filterBody(req.body, ...userInfo);

        const updatedUser = await User.findByIdAndUpdate(id, userRequest,
            {runValidators: true, new: true});
        if (!updatedUser) return res.status(404).send('There is no user with this ID, please log in!');

        res.status(200).json({
            status: 'success',
            data: updatedUser
        })

    } catch (err) {
        console.log(err);
        res.status(500).send(err.message);
    }
}


exports.userDeleteMe = async (req, res) => {
    const userId = req.user.id;
    if (!userId) return res.status(400).send('Your not logged in please log in to use this operation!');

    const user = await User.findByIdAndDelete({id: userId});
    if (!user) {
        return res.status(404).send('There is no user with this ID');
    }
    user.active = req.body.active;

    res.status(203).json({
        status: 'success',
        message: 'user account not activate',
    });
}