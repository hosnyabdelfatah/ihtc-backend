const fs = require('fs');
const Campaign = require('../model/campaignModel');
const AudienceTarget = require('../model/audienceTargetModel');
const filterBody = require('../helpers/filterBody');
const multer = require('multer');
const cloudinary = require('cloudinary').v2
const {Readable} = require('stream');
const sharp = require('sharp');
const uuid = require('uuid');
const Email = require('../utils/email')

const campaignUniqueId = `C-${uuid.v4()}`;
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

exports.uploadCampaignMedia = upload.single('attach');
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

exports.getAllCampaigns = async (req, res) => {
    try {
        let filter = {};
        const organizationId = req.params.organizationId
        console.log(organizationId)
        if (organizationId) filter = {from: organizationId}

        const allCampaigns = await Campaign.find(filter)
            .populate({path: 'organization', model: 'Organization'});
        res.status(200).json({
            status: 'success',
            count: allCampaigns.length,
            data: allCampaigns
        });
    } catch (e) {
        console.log(e);
        ers.status(500).send(e.campaign);
    }
}


exports.getOneCampaign = async (req, res) => {

    if (!id) return res.status(400).send('Campaign Id is require');

}

exports.createCampaign = async (req, res) => {
    let newCampaign;
    let createAudience;
    let receivers;
    let attach;
    let {subject, from, to, status} = req.body;


    const keys = ["subject", "from", "to", "status", "campaignText"];
    const campaignRequest = filterBody(req.body, ...keys);

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
    receivers = to.split('-').map(ele => {
        // console.log(ele)
        return ele.trim()
    });
    // console.log(receivers)

    try {
        const fileBuffer = req.file.buffer;
        newCampaign = await Campaign.create(
            {...campaignRequest, receivers, uniqueId: campaignUniqueId, attach});

        for (let receiver of receivers) {
            // console.log(`R--${receiver}`);
            createAudience = await AudienceTarget.create({campaignUniqueId, receiver});
        }
        res.status(201).json({
            status: 'success',
            campaign: newCampaign
        });
    } catch (e) {
        console.log(e);
        res.status(500).send(e.campaign);
    }
}

exports.updateCampaignStatus = async (req, res) => {
    const campaignId = req.body.id;
    if (!campaignId) return res
        .status(400)
        .send('You must select cmpaign for update or enter its ID');

    const newCampaignStatus = req.body.status;
    if (!newCampaignStatus) return res
        .status(400)
        .send('There is no new status to update');

    const updatedCampaign = await Campaign
        .findByIdAndUpdate(campaignId, {status: newCampaignStatus}, {new: true});
    if (!updatedCampaign) return res.status(400).send('There is no campaign with this ID')

    res.status(200).json({
        campaignTitle: updatedCampaign.subject,
        newStatus: updatedCampaign.status
    })
}