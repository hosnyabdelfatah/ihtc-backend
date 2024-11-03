const multer = require('multer');
const Organization = require('../model/organizationModel');
const Message = require('../model/campaignModel');
const jwt = require('jsonwebtoken');
const filterBody = require('../helpers/filterBody')


exports.getAllOrganizations = async (req, res) => {
    try {
        let filter = {};
        if (req.params.organizationId) filter = {from: req.params.organizationId};
        const allOrganizations = await Organization.find({})
            .populate({
                path: 'country',
                model: "Country",
                select: " -_id"
            });

        res.status(200).json({
            status: 'success',
            count: allOrganizations.length,
            data: allOrganizations
        });
    } catch (err) {
        console.log(err);
        res.status(500).send(err.message);
    }
}

exports.allOgranizationMessages = async (req, res) => {
    try {

        const organizationMessages = await Message.find();

        res.status(200).json({
            status: 'success',
            count: organizationMessages.length,
            data: organizationMessages
        });
    } catch (e) {
        console.log(e);
        res.status(500).send(e.message);
    }
}

exports.organizationGetMe = async (req, res) => {
    const organization = req.organization;
    console.log(organization)

    res.status(200).json({
        name: organization.name,
        avatar: organization.logo
    })
}