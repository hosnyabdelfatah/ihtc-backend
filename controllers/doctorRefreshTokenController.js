const jwt = require("jsonwebtoken");
const Doctor = require("../model/doctorModel");

const handleDoctorRefreshToken = async (req, res) => {
    const cookies = await req.cookies;
    console.log(`doctorRefreshToken is: ${cookies?.doctorJwt}`);

    if (!cookies?.doctorJwt) return res.status(401).json({message: "Please Login!"});

    const doctorRefreshToken = cookies?.doctorJwt;
    // console.log("Cookie is:" + doctorRefreshToken);

    const doctorId = jwt.verify(doctorRefreshToken, process.env.JWT_SECRET_KEY);
    const foundDoctor = await Doctor.findById(doctorId.id).populate([
        {path: "language", model: "Language", select: "title"},
        {path: "country", model: "Country", select: "title"},
        {
            path: "specialty",
            model: "DoctorSpecialty",
            select: "title"
        }
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
            country: foundDoctor.country.title,
            specialty: foundDoctor.specialty.title,
            language: foundDoctor.language.title,
            description: foundDoctor.description,
            token: doctorRefreshToken
        },

    });
};

module.exports = {handleDoctorRefreshToken};
