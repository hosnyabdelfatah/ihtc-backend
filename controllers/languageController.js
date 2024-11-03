const Language = require('../model/languageModel');

exports.getAllLanguage = async (req, res) => {

    try {
        const allLanguage = await Language.find({}).select('-__v ');

        res.status(200).json({
            count: allLanguage.length,
            data: allLanguage
        });

    } catch (err) {
        console.log(err);
        res.status(500).send(err.message);
    }
}

exports.addLanguage = async (req, res) => {
    const {title} = req.body;

    if (!title) return res.status(400).send('Language title must enter!');

    try {
        const isLanguage = await Language.findOne({title});
        if (isLanguage) return res.status(400).send('This language already exists');

        const newLanguage = await Language.create({title});

        res.status(201).json({
            status: 'success',
            data: newLanguage
        });
    } catch (err) {
        console.log(err);
        res.status(500).send(err.message);
    }
}


exports.updateLanguage = async (req, res) => {
    const languageId = req.params.languageId;
    if (!languageId) return res.status(400).send('Select language that you want to update or enter its ID!');

    const {newTitle} = req.body
    if (!newTitle) return res.status(400).send('Yu must enter new title to update the language!');

    try {
        const updatedLanguage = await Language.findByIdAndUpdate(languageId, {title: newTitle}, {new: true});
        if (!updatedLanguage) return res.status(404).send('There is no  language with this id');

        res.status(200).json({
            updateStatus: 'success',
            data: updatedLanguage
        });

    } catch (err) {
        console.log(err)
        res.status(500).send(err.message);
    }
}

exports.deleteLanguage = async (req, res) => {
    const languageId = req.params.languageId;
    if (!languageId) return res.status(400).send('Select language that you want to update or enter its ID!');

    const deletedLanguage = await Language.findByIdAndDelete(languageId);
    if (!deletedLanguage) return res.status(404).send('There is no language with this id');

    res.status(200).send('Delete successful');

}