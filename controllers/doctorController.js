const Doctor = require('../model/doctorModel');

exports.getAllDoctors = async (req, res) => {
    try {
        // const allDoctors = await Doctor.find().select('fname image language country uniqueId -_id');
        const allDoctors = await Doctor.find()
            .populate([
                {path: "language", model: "Language", select: "title"},
                {path: "country", model: "Country", select: "title"},
                {
                    path: "specialty",
                    model: "DoctorSpecialty",
                    select: "title"
                }
            ]);
        res.status(200).json({
            status: 'success',
            data: allDoctors
        });
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