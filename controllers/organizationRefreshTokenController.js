const jwt = require("jsonwebtoken");
const Organization = require("../model/organizationModel");

const handleOrganizationRefreshToken = async (req, res) => {
    console.log("Cookies are:", req.cookies)
    try {
        const cookies = await req.cookies;

        console.log(`organizationRefreshToken is: ${cookies?.organizationJwt}`);

        if (!cookies?.organizationJwt) return res.status(401).json({message: "Please Login!"});

        const organizationRefreshToken = cookies.organizationJwt;
        console.log("Cookie is:" + organizationRefreshToken);

        const organizationId = jwt.verify(organizationRefreshToken, process.env.JWT_SECRET_KEY);
        const foundOrganization = await Organization.findById(organizationId.id)
            .populate({
                path: 'country',
                model: "Country",
                select: " -_id"
            });
        if (!foundOrganization) return res.status(403).json({message: "No organization Found"}); //Forbiden

        res.json({
            data: {
                id: foundOrganization._id,
                name: foundOrganization.name,
                logo: foundOrganization.logo,
                banner: foundOrganization.banner,
                description: foundOrganization.description,
                country: foundOrganization.country.title,
                industryField: foundOrganization.industryField,
                language: foundOrganization.language,
                uniqueId: foundOrganization.uniqueId
            },
            token: organizationRefreshToken,
        });
    } catch (err) {
        console.log(err)
        res.status(500).send(err.message);
    }
};

module.exports = {handleOrganizationRefreshToken};
