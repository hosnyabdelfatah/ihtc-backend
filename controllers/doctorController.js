const Doctor = require('../model/doctorModel');
const filterBody = require("../helpers/filterBody");
exports.getAllDoctors = async (req, res) => {
    try {
        const selectionStore = {};
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const {country, specialty} = req.query;
        const filter = {};
        if (country) filter.country = country;
        if (specialty) filter.specialty = specialty;

        const startIndex = (page - 1) * limit;

        // Query total counts and doctors simultaneously to reduce DB calls
        const [totalDocs, countAllDoctorsSearch, allDoctors, allMatchingDoctors] = await Promise.all([
            Doctor.countDocuments(),
            Doctor.countDocuments(filter),
            Doctor.find(filter)
                .skip(startIndex)
                .limit(limit)
                .populate([
                    {path: "language", model: "Language"},
                    {path: "country", model: "Country"},
                    {path: "specialty", model: "DoctorSpecialty"},
                ]),
            Doctor.find(filter).select("_id"), // IDs of all matching records for selectionStore
        ]);

        allMatchingDoctors.forEach((doctor) => {
            selectionStore[doctor._id] = true;
        });
        

        const totalPages = Math.ceil(totalDocs / limit);
        const totalCurrentSearchDoctorsPages = Math.ceil(countAllDoctorsSearch / limit);
        const pages = country || specialty ? totalCurrentSearchDoctorsPages : totalPages;

        res.status(200).json({
            countResultDocuments: countAllDoctorsSearch,
            countPerPage: allDoctors.length,
            currentPage: page,
            pages,
            totalCurrentSearchDoctorsPages,
            totalItems: totalDocs,
            selectAllSearchResult: selectionStore,
            selectAllSearchResultCount: Object.keys(selectionStore).length,
            data: allDoctors,
        });
    } catch (err) {
        console.error("Error fetching doctors:", err);
        res.status(500).send(err.message);
    }
};


// exports.getAllDoctors = async (req, res) => {
//     try {
//         const selectionStore = {};
//
//         let filter = {};
//         const page = parseInt(req.query.page) || 1;
//         const limit = req.query.limit || 20;
//
//         const {country, specialty} = req.query;
//
//         filter = country ? {...filter, country} : {...filter};
//         filter = specialty ? {...filter, specialty} : {...filter};
//
//         const startIndex = (page - 1) * limit;
//         const totalDocs = await Doctor.countDocuments();
//         const totalPages = Math.ceil(totalDocs / limit);
//         const countAllDoctorsSearch = await Doctor.countDocuments(filter);
//
//         const allDoctors = await Doctor.find(filter).skip(startIndex).limit(limit)
//             .populate([
//                 {path: "language", model: "Language"},
//                 {path: "country", model: "Country"},
//                 {path: "specialty", model: "DoctorSpecialty"}
//             ]);
//
//         let selectAllDoctors
//         if (filter.country || filter.specialty) {
//             selectAllDoctors = await Doctor.find(filter);
//             selectAllDoctors.forEach((doctor) => selectionStore[doctor._id] = true)
//         }
//
//         const totalCurrentSearchDoctorsPages = Math.ceil(countAllDoctorsSearch / limit)
//         const pages = !country && !specialty ? totalPages : totalCurrentSearchDoctorsPages;
//
//         res.status(200).json({
//             countResultDocuments: countAllDoctorsSearch,
//             countPerPage: allDoctors.length,
//             currentPage: page,
//             pages,
//             totalCurrentSearchDoctorsPages,
//             totalItems: totalDocs,
//             selectAllSearchResult: selectionStore,
//             // selectAllDoctors,
//             selectAllSearchResultCount: selectAllDoctors ? Object.keys(selectionStore) : 0,
//             data: allDoctors,
//         });
//     } catch (err) {
//         console.log('Error fetching doctor:', err);
//         res.status(500).send(err.message);
//     }
// }


exports.getDoctor = async (req, res) => {
    console.log(req.params)
    try {
        const doctorId = req.params.doctorId;
        console.log(doctorId)
        const doctor = await Doctor.findById(doctorId);

        if (!doctor) return res.status(400).send('There is no doctor with this unique ID');

        await doctor.populate([
            {path: "language", model: "Language"},
            {path: "country", model: "Country"},
            {
                path: "specialty",
                model: "DoctorSpecialty"
            }
        ]);

        res.status(200).json({
            status: 'success',
            data: {
                id: doctor._id,
                firstName: doctor.fname,
                lastName: doctor.lname,
                profileImage: doctor.image,
                country: doctor.country,
                specialty: doctor.specialty,
                language: doctor.language,
                description: doctor.description
            }
        })

    } catch (err) {
        console.log(err);
        res.status(500).send(err.message);
    }
}

exports.doctorGetMe = async (req, res) => {
    const id = req.params.id;
    console.log(req.params)
    const me = await Doctor.findById(id).populate([
        {path: "language", model: "Language"},
        {path: "country", model: "Country"},
        {path: "specialty", model: "DoctorSpecialty"}
    ]);

    res.status(200).json({
        data: {
            id: me._id,
            firstName: me.fname,
            lastName: me.lname,
            email: me.email,
            specialty: me.specialty,
            country: me.country,
            language: me.language,
            image: me.image,
            workPlace: me.workPlace,
            whatsapp: me.whatsapp,
            facebook: me.facebookId,
            jobTitle: me.jobTitle,
            description: me.description
        }
    })
};

exports.updateMe = async (req, res) => {
    try {
        const id = req.params.id
        let eMessages = '';
        const errMessages = [];
        if (!id) return res.status(400).send('You are not login, please login!');

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
        if (!whatsapp) errMessages.push('Whatsapp number is require!');
        if (!specialty) errMessages.push('Specialty number is require!');
        if (!country) errMessages.push('Country number is require!')

        if (errMessages.length > 0) {
            errMessages.forEach(message => eMessages += `${message}\n`);
            return res.status(400).send(eMessages);
        }
        const doctorRequest = filterBody(req.body, ...doctorInfo);

        const updateDoctor = await Doctor.findByIdAndUpdate(
            id, doctorRequest, {new: true, runValidators: true});

        if (!updateDoctor) return res.status(404).send("No doctor found with this ID");

        res.status(202).json({
            status: "success",
            message: "Profile update success"
        })

    } catch (err) {
        console.log(err)
        res.status(500).send(err.message);
    }
}


exports.doctorDeleteMe = async (req, res) => {
    const doctorId = req.user.id;
    if (!doctorId) return res.status(400).send('Your not logged in please log in to use this operation!');

    const doctor = await Doctor.findByIdAndDelete({id: doctorId});
    if (!doctor) {
        return res.status(404).send('There is no doctor with this ID');
    }
    doctor.active = req.body.active;

    res.status(202).json({
        status: 'success',
        message: 'doctor account not activate',
    });
}