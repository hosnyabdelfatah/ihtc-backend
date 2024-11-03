const DoctorSpecialty = require('../model/doctorSpecialtyModel');


exports.getAllSpecialty= async (req, res) => {
    
    try{
        const allSpecialty = await DoctorSpecialty.find({}).select('-__v ');

        res.status(200).json({
            count: allSpecialty.length,
            data: allSpecialty
        });

    }catch(err){
        console.log(err);
        res.status(500).send(err.message);
    }
}

exports.addDoctorSpecialty = async (req, res) => {
    const { title } = req.body;

    if(!title) return res.status(400).send('Doctor specialty title must enter!');

    try{
        const isExists = await DoctorSpecialty.findOne({title});
        if(isExists) return res.status(400).send('This specialty is already exists!');

        const newDoctorSpecialty = await DoctorSpecialty.create({title});

        res.status(201).json({
            status: 'success',
            doctorSpecialty: newDoctorSpecialty 
        });
    }catch(err){
        console.log(err);
        res.status(500).send(err.message);
    }
}


exports.updateDoctorSpecialty = async (req, res) => {
    const specialtyId = req.params.specialtyId;
    if(!specialtyId) return res.status(400).send('Select specialty that you want to update or enter its ID!');

    const {newTitle} = req.body
    if(!newTitle)return res.status(400).send('Yu must enter new title to update the specialty!');

    try{
        const updatedDoctorSpecialty = await DoctorSpecialty.findByIdAndUpdate(specialtyId, {title: newTitle},{new: true});
        if(!updatedDoctorSpecialty) return res.status(404).send('There is no doctor specialty with this id');

        res.status(200).json({
            updateStatus: 'success',
            updatedSpecialty: updatedDoctorSpecialty
        });

    }catch(err){
        console.log(err)
        res.status(500).send(err.message);
    }
}

exports.deleteDoctorSpecialty = async (req, res) => {
    const specialtyId = req.params.specialtyId;
    if(!specialtyId) return res.status(400).send('Select specialty that you want to update or enter its ID!');

    const deletedDoctorSpecialty = await DoctorSpecialty.findByIdAndDelete(specialtyId);
    if(!deletedDoctorSpecialty) return res.status(404).send('There is no doctor specialty with this id');

    res.status(200).send('Delete successful');
    
}