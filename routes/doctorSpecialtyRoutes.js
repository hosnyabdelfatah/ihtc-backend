const express = require('express');
const doctorSpecialtyController = require('../controllers/doctorSpecialtyController');


const router = express.Router();

router.route('/')
    .get(doctorSpecialtyController.getAllSpecialty)
    .post(doctorSpecialtyController.addDoctorSpecialty);

router.route('/:specialtyId')
.patch(doctorSpecialtyController.updateDoctorSpecialty)
.delete(doctorSpecialtyController.deleteDoctorSpecialty);






module.exports = router;