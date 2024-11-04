const express = require('express');
const languageController = require('../controllers/languageController');

const router = express.Router();

router.route('/')
    .get(languageController.getAllLanguage)
    .post(languageController.addLanguage);

router.route('/:languageId')
    .patch(languageController.updateLanguage)
    .delete(languageController.deleteLanguage);


module.exports = router;