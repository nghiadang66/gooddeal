const UserLevel = require('../models/userLevelModel');
const StoreLevel = require('../models/storeLevelModel');
const { errorHandler } = require('../helpers/errorHandler');

/*------
  USER LEVEL
  ------*/
//?search=...&sortBy=...&order=...
exports.listUserLevel = (req, res) => {
    const search = req.query.search ? req.query.search : '';
    const sortBy = req.query.sortBy ? req.query.sortBy : '_id';
    const order = req.query.order ? req.query.order : 'asc'; //desc

    let filter = {
        search,
        sortBy,
        order,
    };

    UserLevel.find({ name: { $regex: search, $options: 'i' } })
        .sort([[sortBy, order]])
        .exec()
        .then((lvs) => {
            return res.json({
                success: 'Load list user levels successfully',
                filter,
                lvs,
            });
        })
        .catch((error) => {
            return res.status(500).json({
                error: 'Load list user levels failed',
            });
        });
};

exports.getUserLevel = (req, res) => {
    const point = req.user.point >= 0 ? req.user.point : 0;

    UserLevel.find({ minPoint: { $lte: point } })
        .sort('-minPoint')
        .limit(1)
        .exec()
        .then((lvs) => {
            return res.json({
                succes: 'Get user level successfully',
                level: {
                    point: req.user.point,
                    name: lvs[0].name,
                    minPoint: lvs[0].minPoint,
                    discount: lvs[0].discount,
                },
            });
        })
        .catch((error) => {
            return res.status(500).json({
                error: 'Get user level failed',
            });
        });
};

exports.createUserLevel = (req, res) => {
    const { name, minPoint, discount } = req.body;

    const level = new UserLevel({ name, minPoint, discount });
    level.save((error, lv) => {
        if (error || !lv) {
            return res.status(400).json({
                error: errorHandler(error),
            });
        }

        return res.json({
            success: 'Create level successfully',
        });
    });
};

exports.updateUserLevel = (req, res) => {
    const userLevelId = req.params.userLevelId;
    const { name, minPoint, discount } = req.body;

    UserLevel.findOneAndUpdate(
        { _id: userLevelId },
        { $set: { name, minPoint, discount } },
    )
        .exec()
        .then((lv) => {
            if (!lv) {
                return res.status(404).json({
                    error: 'User level not found',
                });
            }

            return res.json({
                success: 'Update level successfully',
            });
        })
        .catch((error) => {
            return res.status(400).json({
                error: errorHandler(error),
            });
        });
};

exports.removeUserLevel = (req, res) => {
    const userLevelId = req.params.userLevelId;

    UserLevel.deleteOne({ _id: userLevelId })
        .exec()
        .then(() => {
            return res.json({
                success: 'Remove level successfully',
            });
        })
        .catch((error) => {
            return res.status(500).json({
                error: 'Remove level failed',
            });
        });
};

/*------
  STORE LEVEL
  ------*/
//?search=...&sortBy=...&order=...
exports.listStoreLevel = (req, res) => {
    const search = req.query.search ? req.query.search : '';
    const sortBy = req.query.sortBy ? req.query.sortBy : '_id';
    const order = req.query.order ? req.query.order : 'asc'; //desc

    let filter = {
        search,
        sortBy,
        order,
    };

    StoreLevel.find({ name: { $regex: search, $options: 'i' } })
        .sort([[sortBy, order]])
        .exec()
        .then((lvs) => {
            return res.json({
                success: 'Load list store levels successfully',
                filter,
                lvs,
            });
        })
        .catch((error) => {
            return res.status(500).json({
                error: 'Load list store levels failed',
            });
        });
};

exports.getStoreLevel = (req, res) => {
    const point = req.store.point >= 0 ? req.store.point : 0;

    StoreLevel.find({ minPoint: { $lte: point } })
        .sort('-minPoint')
        .limit(1)
        .exec()
        .then((lvs) => {
            return res.json({
                succes: 'Get store level successfully',
                level: {
                    point: req.store.point,
                    name: lvs[0].name,
                    minPoint: lvs[0].minPoint,
                    discount: lvs[0].discount,
                },
            });
        })
        .catch((error) => {
            return res.status(500).json({
                error: 'Get store level failed',
            });
        });
};

exports.createStoreLevel = (req, res) => {
    const { name, minPoint, discount } = req.body;

    const level = new StoreLevel({ name, minPoint, discount });
    level.save((error, lv) => {
        if (error || !lv) {
            return res.status(400).json({
                error: errorHandler(error),
            });
        }

        return res.json({
            success: 'Create level successfully',
        });
    });
};

exports.updateStoreLevel = (req, res) => {
    const storeLevelId = req.params.storeLevelId;
    const { name, minPoint, discount } = req.body;

    StoreLevel.findOneAndUpdate(
        { _id: storeLevelId },
        { $set: { name, minPoint, discount } },
    )
        .exec()
        .then((lv) => {
            if (!lv) {
                return res.status(404).json({
                    error: 'User level not found',
                });
            }

            return res.json({
                success: 'Update level successfully',
            });
        })
        .catch((error) => {
            return res.status(400).json({
                error: errorHandler(error),
            });
        });
};

exports.removeStoreLevel = (req, res) => {
    const storeLevelId = req.params.storeLevelId;

    StoreLevel.deleteOne({ _id: storeLevelId })
        .exec()
        .then(() => {
            return res.json({
                success: 'Remove level successfully',
            });
        })
        .catch((error) => {
            return res.status(500).json({
                error: 'Remove level failed',
            });
        });
};
