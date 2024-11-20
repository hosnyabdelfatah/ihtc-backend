const jwt = require("jsonwebtoken");
const User = require("../model/userModel");

const handleUserRefreshToken = async (req, res) => {
    const cookies = await req.cookies;
    console.log(`userRefreshToken is: ${cookies?.userJwt}`);

    if (!cookies?.userJwt) return res.status(401).json({message: "Please Login!"});

    const userRefreshToken = cookies.userJwt;
    // console.log("Cookie is:" + userRefreshToken);

    const userId = jwt.verify(userRefreshToken, process.env.JWT_SECRET_KEY);
    const foundUser = await User.findById(userId.id);
    if (!foundUser) return res.status(403).json({message: "No user Found"}); //Forbidden
    console.log(foundUser)
    res.json({foundUser});
};

module.exports = {handleUserRefreshToken};
