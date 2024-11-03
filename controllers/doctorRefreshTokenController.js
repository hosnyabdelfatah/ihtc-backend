const jwt = require("jsonwebtoken");
const Doctor = require("../model/doctorModel");

const handleDoctorRefreshToken = async (req, res) => {
    const cookies = await req.cookies;
    console.log(`doctorRefreshToken is: ${cookies?.doctorJwt}`);

    if (!cookies?.doctorJwt) return res.status(401).json({message: "Please Login!"});

    const doctorRefreshToken = cookies.doctorJwt;
    // console.log("Cookie is:" + doctorRefreshToken);

    const doctorId = jwt.verify(doctorRefreshToken, process.env.JWT_SECRET_KEY);
    const foundDoctor = await Doctor.findById(doctorId.id);
    if (!foundDoctor) return res.status(403).json({message: "No doctor Found"}); //Forbidden
    console.log(foundDoctor)
    res.json({foundDoctor});
};

module.exports = {handleDoctorRefreshToken};
