const express = require('express');
const roleController = require('../controllers/roleController');

const router = express.Router();

router.route('/')
    .get(roleController.getAllRole)
    .post(roleController.addRole);

router.route('/:roleId')
    .patch(roleController.updateRole)
    .delete(roleController.deleteRole);


module.exports = router;