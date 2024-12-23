const jwt = require("jsonwebtoken");
const Doctor = require("../model/doctorModel");

const handleDoctorRefreshToken = async (req, res) => {
    const cookies = await req.cookies;
    // console.log(`doctorRefreshToken is: ${cookies?.doctorJwt}`);

    if (!cookies?.doctorJwt) {
        return res.status(200).send("Please Login!");
    } else {
        const doctorRefreshToken = cookies?.doctorJwt;
        // console.log("Cookie is:" + doctorRefreshToken);
        if (!doctorRefreshToken) return res.send('Please login')

        const doctorId = jwt.verify(doctorRefreshToken, process.env.JWT_SECRET_KEY);
        const foundDoctor = await Doctor.findById(doctorId.id).populate([
            {path: "language", model: "Language"},
            {path: "country", model: "Country"},
            {path: "specialty", model: "DoctorSpecialty"}
        ]);

        if (!foundDoctor) return res.status(403).json({message: "No doctor Found"}); //Forbidden
        console.log(foundDoctor)
        res.json({
            data: {
                uniqueId: foundDoctor.UniqueId,
                id: foundDoctor._id,
                firstName: foundDoctor.fname,
                lastName: foundDoctor.lname,
                profileImage: foundDoctor.image,
                email: foundDoctor.email,
                whatsapp: foundDoctor.whatsapp,
                facebook: foundDoctor.facebookId,
                jobTitle: foundDoctor.jobTitle,
                workPlace: foundDoctor.workPlace,
                country: foundDoctor.country,
                specialty: foundDoctor.specialty,
                language: foundDoctor.language,
                description: foundDoctor.description,
                token: doctorRefreshToken
            },

        });
    }


};

module.exports = {handleDoctorRefreshToken};
