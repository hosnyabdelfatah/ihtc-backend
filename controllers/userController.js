const User = require('../model/userModel');

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
                {path: "language", model: "Language", select: "title"},
                {path: "country", model: "Country", select: "title"},
                {
                    path: "specialty",
                    model: "UserSpecialty",
                    select: "title"
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

exports.userGetMe = (req, res) => {
    const user = req.user;
    console.log(user)

    res.status(200).json({
        name: user.fname + ' ' + user.lname,
        avatar: user.image
    })
};


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