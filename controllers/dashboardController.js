const fs = require('fs');
const path = require('path');
const multer = require('multer');
const Doctor = require('../model/doctorModel');
const DoctorSpecialty = require('../model/doctorSpecialtyModel');
const csvParser = require("csv-parser");
const axios = require('axios');


//Add Doctors
exports.addDoctorsFromJsonFile = async (req, res) => {
    const filePath = req.file.path;
    const results = [];
    try {
        console.log(req.file)
        console.log(req.body)

        const fileExtension = path.extname(req.file.originalname).toLowerCase();
        if (fileExtension === '.csv') {
            fs.createReadStream(filePath)
                .pipe(csvParser())
                .on('data', (row) => results.push(row))
                .on('end', async () => {
                    try {
                        await Doctor.insertMany(results, {strict: false});
                    } catch (err) {
                        console.error('Error inserting data:', err);
                        res.status(500).json({message: 'Error inserting data', error: err.message});
                    } finally {
                        fs.unlinkSync(filePath)
                    }
                })
        } else if (fileExtension === '.json') {
            const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

            try {
                await Doctor.insertMany(jsonData, {strict: false});
                res.status(200).json({message: 'Data inserted successfully', jsonData});
            } catch (err) {
                console.error('Error inserting data:', err);
                res.status(500).json({message: 'Error inserting data', error: err.message});
            } finally {
                fs.unlinkSync(filePath)
            }
        } else {
            res.status(400).json({message: 'Unsupported file format. Please upload a CSV or JSON file.'});
        }
    } catch (err) {
        console.log(err)
        res.status(500).send(err.message);
    }
}

exports.addDoctorsFromCsvFile = async (req, res) => {
    try {
        const results = [];
        const dataFile = req.file;
        if (!dataFile) return res.status(400).send('.No data file selected!');

        const jsonData = fs.createReadStream(dataFile)
            .pipe(csvParser())
            .on('data', (row) => results.push(row))
            .on('end', async () => {

                const result = await Doctor.insertMany(jsonData, {strict: false});

                res.status(200).json({
                    message: 'Data inserted successfully',
                    result
                })
            })
            .on('error', (err) => {
                console.error('Error reading CSV file:', err);
                res.status(500).json({message: 'Error reading CSV file', error: err.message});
            })

    } catch (err) {
        console.log(err)
        res.status(500).send(err.message);
    }
}


//Add SpecialtyDoctor

exports.addSpecialtyDoctorsFromJsonFile = async (req, res) => {
    try {
        const dataFile = req.file;
        if (!dataFile) return res.status(400).send('.No data file selected!');

        const jsonData = await JSON.parse(fs.readFileSync(dataFile, 'utf-8'));

        const result = await DoctorSpecialty.insertMany(jsonData, {strict: false});

        res.status(200).json({
            message: 'Data inserted successfully',
            result
        })
    } catch (err) {
        console.log(err)
        res.status(500).send(err.message);
    }
}