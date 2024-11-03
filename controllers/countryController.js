const Country = require('../model/countryModel');

exports.getAllCountry = async (req, res) => {

    try {
        const allCountry = await Country.find({}).select('-__v ');

        res.status(200).json({
            count: allCountry.length,
            data: allCountry
        });

    } catch (err) {
        console.log(err);
        res.status(500).send(err.message);
    }
}

exports.addCountry = async (req, res) => {
    const {title} = req.body;

    if (!title) return res.status(400).send('Country title must enter!');

    try {
        const isCountry = await Country.findOne({title});
        if (isCountry) return res.status(400).send('This country already exists');

        const newCountry = await Country.create({title});

        res.status(201).json({
            status: 'success',
            data: newCountry
        });
    } catch (err) {
        console.log(err);
        res.status(500).send(err.message);
    }
}


exports.updateCountry = async (req, res) => {
    const countryId = req.params.countryId;
    if (!countryId) return res.status(400).send('Select country that you want to update or enter its ID!');

    const {newTitle} = req.body
    if (!newTitle) return res.status(400).send('Yu must enter new title to update the country!');

    try {
        const updatedCountry = await Country.findByIdAndUpdate(countryId, {title: newTitle}, {new: true});
        if (!updatedCountry) return res.status(404).send('There is no  country with this id');

        res.status(200).json({
            updateStatus: 'success',
            data: updatedCountry
        });

    } catch (err) {
        console.log(err)
        res.status(500).send(err.message);
    }
}

exports.deleteCountry = async (req, res) => {
    const countryId = req.params.countryId;
    if (!countryId) return res.status(400).send('Select country that you want to update or enter its ID!');

    const deletedCountry = await Country.findByIdAndDelete(countryId);
    if (!deletedCountry) return res.status(404).send('There is no country with this id');

    res.status(200).send('Delete successful');

}