const Commission = require('../models/commissionModel');
const { errorHandler } = require('../helpers/errorHandler');

//?search=...&sortBy=...&order=...
exports.listCommissions = (req, res) => {
    const search = req.query.search ? req.query.search : '';
    const sortBy = req.query.sortBy ? req.query.sortBy : '_id';
    const order = req.query.order ? req.query.order : 'asc'; //desc;

    const filter = {
        search,
        sortBy,
        order,
    };

    Commission.find({ business_type: { $regex: search, $options: 'i' } })
        .sort([[sortBy, order]])
        .exec()
        .then((commissions) => {
            return res.json({
                success: 'Load list commissions successfully',
                filter,
                commissions,
            });
        })
        .catch((error) => {
            return res.status(500).json({
                error: 'Load list commissions failed',
            });
        });
};

exports.listActiveCommissions = (req, res) => {
    Commission.find({ isDeleted: false })
        .exec()
        .then((commissions) => {
            commissions.forEach((commission) => {
                commission.isDeleted = undefined;
            });

            return res.json({
                success: 'Load list active commissions successfully',
                commissions,
            });
        })
        .catch((error) => {
            return res.status(500).json({
                error: 'Load list active commissions failed',
            });
        });
};

exports.createCommission = (req, res) => {
    const { business_type, cost } = req.body;

    const commission = new Commission({ business_type, cost });
    commission.save((error, commission) => {
        if (error || !commission) {
            return res.status(400).json({
                error: errorHandler(error),
            });
        }

        return res.json({
            success: 'Create commission successfully',
        });
    });
};

exports.updateCommission = (req, res) => {
    const commissionId = req.params.commissionId;
    const { business_type, cost } = req.body;

    Commission.findOneAndUpdate(
        { _id: commissionId },
        { $set: { business_type, cost } },
    )
        .exec()
        .then((commission) => {
            if (!commission) {
                return res.status(404).json({
                    error: 'Commission not found',
                });
            }

            return res.json({
                success: 'Update commission successfully',
            });
        })
        .catch((error) => {
            return res.status(404).json({
                error: 'Commission not found',
            });
        });
};

exports.removeCommission = (req, res) => {
    const commissionId = req.params.commissionId;

    Commission.findOneAndUpdate(
        { _id: commissionId },
        { $set: { isDeleted: true } },
    )
        .exec()
        .then((commission) => {
            if (!commission) {
                return res.status(404).json({
                    error: 'Commission not found',
                });
            }

            return res.json({
                success: 'Remove commission successfully',
            });
        })
        .catch((error) => {
            return res.status(404).json({
                error: 'Commission not found',
            });
        });
};

exports.restoreCommission = (req, res) => {
    const commissionId = req.params.commissionId;

    Commission.findOneAndUpdate(
        { _id: commissionId },
        { $set: { isDeleted: false } },
    )
        .exec()
        .then((commission) => {
            if (!commission) {
                return res.status(404).json({
                    error: 'Commission not found',
                });
            }

            return res.json({
                success: 'Restore commission successfully',
            });
        })
        .catch((error) => {
            return res.status(404).json({
                error: 'Commission not found',
            });
        });
};
