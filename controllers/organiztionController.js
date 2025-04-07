const multer = require('multer');
const Organization = require('../model/organizationModel');
const Message = require('../model/campaignModel');
const jwt = require('jsonwebtoken');
const filterBody = require('../helpers/filterBody')


exports.getAllOrganizations = async (req, res) => {
    try {
        const {country} = req.query;
        let filter = {};
        filter = country ? {...filter, country} : {};

        const allOrganizations = await Organization.find(filter)
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

exports.getOrganization = async (req, res) => {
    try {
        const id = req.params.organizationId;
        if (!id) return res.status(400).send('Please select organization or write its ID');

        const organization = await Organization.findById(id).populate({
            path: 'country',
            model: "Country",
            select: " -_id"
        });

    } catch (err) {
        console.log(err);
        res.status(500).send(err.message);
    }
}

exports.allOrganizationMessages = async (req, res) => {
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
    try {

        const organization = req.organization;
        console.log('req.organization')

        // const organization = await Organization.findById(id).populate({path: 'country', model: "Country"});
        if (!organization) return res.status(404).send('There is no organization ith this ID');


        res.status(200).json({
            status: "success",
            data: organization
        });
    } catch (e) {
        console.log(e)
    }
}


exports.updateOrganization = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) return res.status(400).send('You are not logged in, please log in!');

        const errMessages = [];
        let eMessages = ``;

        const {
            name, email, phone, mobile,
            description, industryField, country
        } = req.body;
        const organizationInfo = ["name", "email", "phone", "mobile", "description", "industryField", "country"];

        if (!name) errMessages.push('You must enter your name!');
        if (!email) errMessages.push('You must enter your email!');
        if (!phone) errMessages.push('You must enter your phone!');
        if (!mobile) errMessages.push('You must enter your mobile!');
        if (!description) errMessages.push('You must enter your description!');
        if (!industryField) errMessages.push('You must enter your industryField!');
        if (!country) errMessages.push('You must enter your country!');

        if (errMessages.length > 0) {
            errMessages.forEach(message => eMessages += `${message}\n`);
            return res.status(400).send(eMessages);
        }

        const organizationRequest = filterBody(req.body, ...organizationInfo);

        const updatedOrganization = await Organization.findByIdAndUpdate(
            id, organizationRequest, {new: true, runValidators: true}).populate({path: 'country', model: 'Country'});

        if (!updatedOrganization) return res.send(404).send('There is no organization with this Data!');

        res.status(200).json({
            status: 'success',
            data: {
                id: updatedOrganization.id,
                name: updatedOrganization.name,
                email: updatedOrganization.email,
                phone: updatedOrganization.phone,
                mobile: updatedOrganization.mobile,
                industryField: updatedOrganization.industryField,
                country: updatedOrganization.country,
                description: updatedOrganization.description
            }
        });

    } catch (err) {
        console.log(err)
    }
}