const AudienceTarget = require('../model/audienceTargetModel');

exports.getAllAudience = async (req, res) => {
    let filter = {};
    const campaignId = req.params.campaignId;
    if (campaignId) filter = {campaign: campaignId};
 
    const allCampaignAudience = await AudienceTarget.find(filter);
}