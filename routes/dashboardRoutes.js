const express = require('express');
const dashboardController = require('../controllers/dashboardController');

const router = express.Router();

router.route('/insert-json-doctors').post(dashboardController.addDoctorsFromJsonFile);
router.route('/insert-csv-doctors').post(dashboardController.addDoctorsFromCsvFile);


module.exports = router;