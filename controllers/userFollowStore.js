const UserFollowStore = require('../models/userFollowStore');
const Store = require('../models/store');
const { cleanStore } = require('../helpers/storeHandler');

exports.followStore = (req, res) => {
    const userId = req.user._id;
    const storeId = req.store._id;
    const follow = new UserFollowStore({ userId, storeId });
    follow.save((error, follow) => {
        if (error || !follow) {
            return res.status(400).json({
                error: 'Follow is already exists',
            });
        } else {
            Store.findOne({ _id: storeId })
                .populate('commissionId')
                .exec()
                .then((store) => {
                    if (!store) {
                        return res.status(404).json({
                            error: 'Store not found',
                        });
                    }

                    return res.json({
                        success: 'Follow store successfully',
                        store: cleanStore(store),
                    });
                })
                .catch((error) => {
                    return res.status(500).json({
                        error: 'Follow store failed',
                    });
                });
        }
    });
};

exports.unfollowStore = (req, res) => {
    const userId = req.user._id;
    const storeId = req.store._id;

    UserFollowStore.findOneAndDelete({ userId, storeId })
        .exec()
        .then((follow) => {
            if (!follow) {
                return res.status(400).json({
                    error: 'Follow is already exists',
                });
            } else {
                Store.findOne({ _id: storeId })
                    .populate('commissionId')
                    .exec()
                    .then((store) => {
                        if (!store) {
                            return res.status(404).json({
                                error: 'Store not found',
                            });
                        }

                        return res.json({
                            success: 'UnFollow store successfully',
                            store: cleanStore(store),
                        });
                    })
                    .catch((error) => {
                        return res.status(500).json({
                            error: 'UnFollow store failed',
                        });
                    });
            }
        })
        .catch((error) => {
            return res.status(404).json({
                error: 'not follow yet',
            });
        });
};

exports.checkFollowingStore = (req, res) => {
    const userId = req.user._id;
    const storeId = req.store._id;

    UserFollowStore.findOne({ userId: userId, storeId: storeId })
        .exec()
        .then((follow) => {
            if (!follow) {
                return res.json({
                    error: 'Following store not found',
                });
            } else {
                return res.json({
                    success: 'Following store',
                });
            }
        })
        .catch((error) => {
            return res.status(404).json({
                error: 'Following store not found',
            });
        });
};

exports.getNumberOfFollowers = (req, res) => {
    const storeId = req.store._id;
    UserFollowStore.countDocuments({ storeId: storeId }, (error, count) => {
        if (error) {
            return res.status(404).json({
                error: 'Following stores not found',
            });
        }

        return res.json({
            success: 'get store number of followers successfully',
            count,
        });
    });
};

//?limit=...&page=...
exports.listFollowingStoresByUser = (req, res) => {
    const userId = req.user._id;
    const limit =
        req.query.limit && req.query.limit > 0 ? parseInt(req.query.limit) : 6;
    const page =
        req.query.page && req.query.page > 0 ? parseInt(req.query.page) : 1;
    let skip = (page - 1) * limit;

    const filter = {
        limit,
        pageCurrent: page,
    };

    UserFollowStore.find({ userId })
        .exec()
        .then((follows) => {
            const storeIds = follows.map((follow) => follow.storeId);

            Store.countDocuments(
                { _id: { $in: storeIds }, isActive: true },
                (error, count) => {
                    if (error) {
                        return res.status(404).json({
                            error: 'Following stores not found',
                        });
                    }

                    const size = count;
                    const pageCount = Math.ceil(size / limit);
                    filter.pageCount = pageCount;

                    if (page > pageCount) {
                        skip = (pageCount - 1) * limit;
                    }

                    if (count <= 0) {
                        return res.json({
                            success: 'Load list following stores successfully',
                            filter,
                            size,
                            stores: [],
                        });
                    }

                    Store.find({ _id: { $in: storeIds }, isActive: true })
                        .select('-e_wallet')
                        .sort({ name: 1 })
                        .skip(skip)
                        .limit(limit)
                        .populate('ownerId')
                        .populate('staffIds')
                        .populate('commissionId', '_id name cost')
                        .exec()
                        .then((stores) => {
                            const cleanStores = stores.map((store) =>
                                cleanStore(store),
                            );
                            return res.json({
                                success:
                                    'Load list following stores successfully',
                                filter,
                                size,
                                stores: cleanStores,
                            });
                        })
                        .catch((error) => {
                            return res.status(500).json({
                                error: 'Load list followings stores failed',
                            });
                        });
                },
            );
        })
        .catch((error) => {
            return res.status(500).json({
                error: 'Load list followings stores failed',
            });
        });
};
