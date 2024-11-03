const express = require('express');
const countryController = require('../controllers/countryController');

const router = express.Router();

router.route('/')
    .get(countryController.getAllCountry)
    .post(countryController.addCountry);

router.route('/:countryId')
    .patch(countryController.updateCountry)
    .delete(countryController.deleteCountry);


module.exports = router;