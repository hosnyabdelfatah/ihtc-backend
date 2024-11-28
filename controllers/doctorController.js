const Doctor = require('../model/doctorModel');

exports.getAllDoctors = async (req, res) => {
    try {
        let filter = {};
        const page = parseInt(req.query.page) || 1;
        const limit = req.query.limit || 20;

        const {country, specialty} = req.query;

        filter = country ? {...filter, country} : {};
        filter = specialty ? {...filter, specialty} : {...filter};

        console.log(filter)

        const startIndex = (page - 1) * limit;

        const totalDocs = await Doctor.countDocuments();
        const totalPages = Math.ceil(totalDocs / limit);

        const allDoctors = await Doctor.find(filter).skip(startIndex).limit(limit)
            .populate([
                {path: "language", model: "Language", select: "title"},
                {path: "country", model: "Country", select: "title"},
                {
                    path: "specialty",
                    model: "DoctorSpecialty",
                    select: "title"
                }
            ]);

        const totalCurrentSearchDoctorsPages = Math.ceil(allDoctors.length / limit)
        const pages = !country && !specialty ? totalPages : totalCurrentSearchDoctorsPages;
        // console.log(`${allDoctors.length} / ${limit}`)

        res.status(200).json({
            count: allDoctors.length,
            currentPage: page,
            pages,
            totalItems: totalDocs,
            data: allDoctors,
        });
    } catch (err) {
        console.log('Error fetching doctor:', err);
        res.status(500).send(err.message);
    }
}

exports.getDoctor = async (req, res) => {
    try {
        const doctorId = req.params.doctorId;
        console.log(doctorId)
        const doctor = await Doctor.findOne({_id: doctorId}).populate([
            {path: "language", model: "Language", select: "title"},
            {path: "country", model: "Country", select: "title"},
            {
                path: "specialty",
                model: "DoctorSpecialty",
                select: "title"
            }
        ]);

        if (!doctor) return res.status(400).send('There is no doctor with this unique ID');

        res.status(200).json({
            status: 'success',
            data: {
                id: doctor._id,
                firstName: doctor.fname,
                lastName: doctor.lname,
                profileImage: doctor.image,
                country: doctor.country.title.trim(),
                specialty: doctor.specialty.title.trim(),
                language: doctor.language.title.trim(),
                description: doctor.description
            }
        })

    } catch (err) {
        console.log(err);
        res.status(500).send(err.message);
    }
}

exports.doctorGetMe = (req, res) => {
    const doctor = req.doctor;
    console.log(doctor)

    res.status(200).json({
        name: doctor.fname + ' ' + doctor.lname,
        avatar: doctor.image
    })
};


exports.doctorDeleteMe = async (req, res) => {
    const doctorId = req.user.id;
    if (!doctorId) return res.status(400).send('Your not logged in please log in to use this operation!');

    const doctor = await Doctor.findByIdAndDelete({id: doctorId});
    if (!doctor) {
        return res.status(404).send('There is no doctor with this ID');
    }
    doctor.active = req.body.active;

    res.status(203).json({
        status: 'success',
        message: 'doctor account not activate',
    });
}