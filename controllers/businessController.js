const Business = require('../models/businessModel');
const { errorHandler } = require('../helpers/errorHandler');

exports.createBusiness = (req, res) => {
    const { name, commission } = req.body;

    const business = new Business({ name, commission });
    business.save((error, bussiness) => {
        if (error || !bussiness) {
            return res.status(400).json({
                error: errorHandler(error),
            });
        }

        return res.json({
            success: 'Create level successfully',
        });
    });
};
