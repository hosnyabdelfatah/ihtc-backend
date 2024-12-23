// const fs = require('fs');
const DoctorMessage = require('../model/doctorMessageModel');
const MessageAudienceTarget = require('../model/messageAudienceTargetModel');
const filterBody = require('../helpers/filterBody');
const multer = require('multer');
const cloudinary = require('cloudinary').v2
const {Readable} = require('stream');
const sharp = require('sharp');
const uuid = require('uuid');
const Email = require('../utils/email');

const messageUniqueId = `M-${uuid.v4()}`;
///////////////////////// Multer

// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         if (file.mimetype.startsWith('video')) {
//             cb(null, 'video')
//         } else if (file.mimetype.startsWith('image')) {
//             cb(null, 'img')
//         } else if (file.endsWith('.pdf')) {
//             cb(null, 'text')
//         } else {
//             console.log(file.mimetype)
//             cb({error: 'Mime type not supported'})
//         }
//
//         let campaignDir = '';
//         if (!fs.existsSync(`./public/attaches/campaigns/${campaignUniqueId}`)) {
//             fs.mkdirSync(`./public/attaches/campaigns/${campaignUniqueId}`);
//             campaignDir = `./public/attaches/campaigns/${campaignUniqueId}`
//         } else {
//             campaignDir = `./public/attaches/campaigns/${campaignUniqueId}`
//         }
//         cb(null, campaignDir)
//     },
//     filename: (req, file, cb) => {
//         const fileName = file.originalname;
//         cb(null, file.originalname);
//     }
// });

cloudinary.config({
    cloud_name: process.env.COUDINARY_CLOUD_NAME,
    api_key: process.env.COUDINARY_API_KEY,
    api_secret: process.env.COUDINARY_API_SECRET,
})
// const upload = multer({storage: multer.memoryStorage()});
const multerFilter = (req, file, cb) => {
    console.log(file.mimetype)
    if (file.mimetype.startsWith('video') || file.mimetype.startsWith('image' || file.mimetype.endsWith('.pdf'))) {
        cb(null, true)
    } else {
        cb('Not supported file to upload! Please upload only images  videos or pdf file. ', false);
    }
}

const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: multerFilter
});

exports.uploadMessageMedia = upload.single('attach');
///////// Resize Image /////////
// exports.resizeImage = async (req, res, next) => {
//     // console.log(`File is: ${req.file}`);
//     if (!req.file) return next();
//
//     const namedFile = req.file.originalname;
//     if (namedFile)
//         await sharp(req.file.buffer)
//             .resize(300, 300)
//             .toFormat('webp')
//             .webp({quality: 90})
//             .toFile(`./server/public/campaigns/${campaignUniqueId}/${namedFile}`);
//
//     next();
// }
////////////////////////////////////////
//:TODO resize  video with sharp
/////////////////////////

exports.getAllDoctorMessagesOut = async (req, res) => {
    try {

        const doctorId = req.params.doctorId
        console.log(doctorId)


        const allDoctorMessageOut = await DoctorMessage.find({from: doctorId})
            .populate([
                {path: 'from', model: 'Doctor'},
                {path: 'receiver', model: 'Organization', select: "name"}
            ]);

        res.status(200).json({
            status: 'success',
            count: allDoctorMessageOut.length,
            data: allDoctorMessageOut
        });
    } catch (err) {
        console.log(err);
        res.status(500).send(err.message);
    }
}

exports.getOneMessage = async (req, res) => {
    try {
        const id = req.params.messageId;
        console.log(id)
        if (!id) return res.status(400).send('Message ID is required select message or enter its ID!');

        const message = await DoctorMessage.findById(id)
            .populate(
                [
                    {path: 'from', model: 'Doctor', select: 'fname lname'},
                    {path: 'receiver', model: 'Organization', select: 'name'}
                ]
            );

        if (!message) return res.status(404).send('There is no message with this ID!');

        res.status(200).json({
            status: 'success',
            data: message
        });
    } catch (err) {
        console.log(err);
        res.status(500).send('There is no message with this ID!')
    }
}

exports.createMessage = async (req, res) => {

    try {
        const fileBuffer = req.file.buffer;
        let newMessage;
        let sender;
        let receiver;
        let attach;

        console.log(req.body);

        const keys = ["subject", "from", "to", "status", "messageText"];
        const messagenRequest = filterBody(req.body, ...keys);

        const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream((error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
            // Convert buffer to stream
            Readable.from(fileBuffer).pipe(stream);
        });

        const fileUrl = uploadResult.secure_url;
        if (req.file)
            attach = fileUrl;


        newMessage = await DoctorMessage.create(
            {...messagenRequest, receiver: req.body.to, uniqueId: messageUniqueId, attach});

        // console.log(`R--${receiver}`);
        await MessageAudienceTarget.create({messageUniqueId, receiver: req.body.to});

        res.status(201).json({
            status: 'success',
            data: newMessage
        });
    } catch (err) {
        console.log(err);
        res.status(500).send(err.message);
    }
}

exports.updateMessageStatus = async (req, res) => {
    const messageId = req.body.id;
    if (!messageId) return res
        .status(400)
        .send('You must select message for update or enter its ID');

    const newMessageStatus = req.body.status;
    if (!newMessageStatus) return res
        .status(400)
        .send('There is no new status to update');

    const updatedMessage = await DoctorMessage.findByIdAndUpdate(messageId,
        {status: newMessageStatus}, {new: true});
    if (!updatedMessage) return res.status(400).send('There is no message with this ID')

    res.status(200).json({
        campaignTitle: updatedMessage.subject,
        newStatus: updatedMessage.status
    })
}
