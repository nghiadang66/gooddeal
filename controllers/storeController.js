const Store = require('../models/storeModel');
const User = require('../models/userModel');
const { errorHandler } = require('../helpers/errorHandler');

/*------
  STORE
  ------*/
exports.storeById = (req, res, next, id) => {
    Store.findById(id, (error, store) => {
        if (error || !store) {
            return res.status(404).json({
                error: 'Store not found',
            });
        }

        req.store = store;
        next();
    });
};

exports.getStore = (req, res) => {
    let store = req.store;
    res.json({
        success: 'Get store successfully',
        store,
    });
};

exports.getStoreByUser = (req, res) => {
    Store.findOne({
        $or: [{ ownerId: req.user._id }, { staffIds: req.user._id }],
    })
        .exec()
        .then((store) => {
            if (!store) {
                return res.status(404).json({
                    error: 'Store not found',
                });
            }

            return res.json({
                success: 'Get store by user successfully',
                store,
            });
        })
        .catch((error) => {
            return res.status(404).json({
                error: 'Store not found',
            });
        });
};

exports.listStores = (req, res) => {};

exports.createStore = (req, res) => {
    if (req.user.role != 'customer') {
        return res.status(401).json({
            error: 'User store is exists',
        });
    }

    const { name, bio } = req.body;
    const store = new Store({ name, bio, ownerId: req.user._id });
    store.save((error, store) => {
        if (error) {
            return res.status(400).json({
                error: errorHandler(error),
            });
        }

        User.findOneAndUpdate(
            { _id: req.user._id },
            { $set: { role: 'vendor' } },
        )
            .exec()
            .then((user) => {
                if (!user) {
                    return res.status(500).json({
                        error: 'User not found',
                    });
                }

                return res.json({
                    success: 'Create store successfully',
                    store,
                });
            })
            .catch((error) => {
                if (!user) {
                    return res.status(500).json({
                        error: errorHandler(error),
                    });
                }
            });
    });
};
