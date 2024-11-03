const jwt = require("jsonwebtoken");
const Organization = require("../model/organizationModel");

const handleOrganizationRefreshToken = async (req, res) => {
    const cookies = await req.cookies;
    console.log(`organizationRefreshToken is: ${cookies?.organizationJwt}`);

    if (!cookies?.organizationJwt) return res.status(401).json({message: "Please Login!"});

    const organizationRefreshToken = cookies.organizationJwt;
    console.log("Cookie is:" + organizationRefreshToken);

    const organizationId = jwt.verify(organizationRefreshToken, process.env.JWT_SECRET_KEY);
    const foundOrganization = await Organization.findById(organizationId.id);
    if (!foundOrganization) return res.status(403).json({message: "No organization Found"}); //Forbiden

    res.json({organizationRefreshToken});
};

module.exports = {handleOrganizationRefreshToken};
