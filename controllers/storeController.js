const Store = require('../models/storeModel');
const User = require('../models/userModel');
const fs = require('fs');
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
    store.ownerId = undefined;
    store.staffIds = undefined;
    store.e_wallet = undefined;
    store.amount_spent = undefined;

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

exports.createStore = (req, res) => {
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

exports.updateStore = (req, res) => {
    const { name, bio } = req.body;

    Store.findOneAndUpdate({ _id: req.store._id }, { $set: { name, bio } })
        .exec()
        .then((store) => {
            if (!store) {
                return res.status(500).json({
                    error: 'Store not found',
                });
            }

            return res.json({
                success: 'Update store successfully',
            });
        })
        .catch((error) => {
            return res.json({
                error: 'Update store failed',
            });
        });
};

/*------
  ACTIVE
  ------*/
exports.activeStore = (req, res) => {
    const { isActive } = req.body;

    Store.findOneAndUpdate({ _id: req.store._id }, { $set: { isActive } })
        .exec()
        .then((store) => {
            if (!store) {
                return res.status(500).json({
                    error: 'Store not found',
                });
            }

            return res.json({
                success: 'Active/inactive store successfully',
            });
        })
        .catch((error) => {
            return res.json({
                error: 'Active/inactive store failed',
            });
        });
};

/*------
  STATUS
  ------*/
exports.getStatusEnum = (req, res) => {
    return res.json({
        success: 'Get status enum successfully',
        status_enum: Store.schema.path('status').enumValues,
    });
};

exports.updateStatus = (req, res) => {
    const { status } = req.body;

    Store.findOneAndUpdate({ _id: req.store._id }, { $set: { status } })
        .exec()
        .then((store) => {
            if (!store) {
                return res.status(500).json({
                    error: 'Store not found',
                });
            }

            return res.json({
                success: 'Update store status successfully',
            });
        })
        .catch((error) => {
            return res.json({
                error: 'Update store status store failed',
            });
        });
};

/*------
  AVATAR
  ------*/
exports.getAvatar = (req, res) => {
    let avatar = req.store.avatar;
    return res.json({
        success: 'load avatar successfully',
        avatar,
    });
};

exports.updateAvatar = (req, res) => {
    const oldpath = req.store.avatar;

    Store.findOneAndUpdate(
        { _id: req.store._id },
        { $set: { avatar: req.filepath } },
        { new: true },
    )
        .exec()
        .then((store) => {
            if (!store) {
                try {
                    fs.unlinkSync('public' + req.filepath);
                } catch {}

                return res.status(500).json({
                    error: 'Store not found',
                });
            }

            if (oldpath != '/uploads/default.jpg') {
                try {
                    fs.unlinkSync('public' + oldpath);
                } catch {}
            }

            return res.json({
                success: 'Update avatar successfully',
                // store,
            });
        })
        .catch((error) => {
            try {
                fs.unlinkSync('public' + req.filepath);
            } catch {}

            return res.status(500).json({
                error: errorHandler(error),
            });
        });
};

/*------
  COVER
  ------*/
exports.getCover = (req, res) => {
    let cover = req.store.cover;
    return res.json({
        success: 'load cover successfully',
        cover,
    });
};

exports.updateCover = (req, res) => {
    const oldpath = req.store.cover;

    Store.findOneAndUpdate(
        { _id: req.store._id },
        { $set: { cover: req.filepath } },
        { new: true },
    )
        .exec()
        .then((store) => {
            if (!store) {
                try {
                    fs.unlinkSync('public' + req.filepath);
                } catch {}

                return res.status(500).json({
                    error: 'Store not found',
                });
            }

            if (oldpath != '/uploads/default.jpg') {
                try {
                    fs.unlinkSync('public' + oldpath);
                } catch {}
            }

            return res.json({
                success: 'Update cover successfully',
                // store,
            });
        })
        .catch((error) => {
            try {
                fs.unlinkSync('public' + req.filepath);
            } catch {}

            return res.status(500).json({
                error: errorHandler(error),
            });
        });
};

/*------
  FEATURE IMAGES
  ------*/
exports.getFeatureImages = (req, res) => {
    let featured_images = req.store.featured_images;
    return res.json({
        success: 'load cover successfully',
        featured_images,
    });
};

exports.addFeatureImage = (req, res) => {
    let featured_images = req.store.featured_images;

    const index = featured_images.length;
    if (index >= 6) {
        try {
            fs.unlinkSync('public' + req.filepath);
        } catch {}

        return res.status(400).json({
            error: 'The limit is 6 images',
        });
    }

    Store.findOneAndUpdate(
        { _id: req.store._id },
        { $push: { featured_images: req.filepath } },
        { new: true },
    )
        .exec()
        .then((store) => {
            if (!store) {
                try {
                    fs.unlinkSync('public' + req.filepath);
                } catch {}

                return res.status(500).json({
                    error: 'Store not found',
                });
            }

            return res.json({
                success: 'Add featured image successfully',
                // store,
            });
        })
        .catch((error) => {
            try {
                fs.unlinkSync('public' + req.filepath);
            } catch {}

            return res.status(500).json({
                error: errorHandler(error),
            });
        });
};

exports.updateFeatureImage = (req, res) => {
    let index;
    if (!req.query.index) {
        try {
            fs.unlinkSync('public' + req.filepath);
        } catch {}

        return res.status(400).json({
            error: 'Index not found',
        });
    } else {
        index = req.query.index;
    }

    let featured_images = req.store.featured_images;
    if (index >= featured_images.length) {
        try {
            fs.unlinkSync('public' + req.filepath);
        } catch {}

        return res.status(404).json({
            error: 'Feature image not found',
        });
    }

    const oldpath = featured_images[index];
    featured_images[index] = req.filepath;
    Store.findOneAndUpdate(
        { _id: req.store._id },
        { $set: { featured_images } },
        { new: true },
    )
        .exec()
        .then((store) => {
            if (!store) {
                try {
                    fs.unlinkSync('public' + req.filepath);
                } catch {}

                return res.status(500).json({
                    error: 'Store not found',
                });
            }

            if (oldpath != '/uploads/default.jpg') {
                try {
                    fs.unlinkSync('public' + oldpath);
                } catch {}
            }

            return res.json({
                success: 'Update feature image successfully',
                // store,
            });
        })
        .catch((error) => {
            try {
                fs.unlinkSync('public' + req.filepath);
            } catch {}

            return res.status(500).json({
                error: errorHandler(error),
            });
        });
};

exports.removeFeaturedImage = (req, res) => {
    let index;
    if (!req.query.index) {
        return res.status(400).json({
            error: 'Index not found',
        });
    } else {
        index = req.query.index;
    }

    let featured_images = req.store.featured_images;
    if (index >= featured_images.length) {
        return res.status(404).json({
            error: 'Feature image not found',
        });
    }

    try {
        fs.unlinkSync('public' + featured_images[index]);
    } catch (e) {
        return res.status(500).json({
            error: 'Remove featured image failed',
        });
    }

    //update db
    featured_images.splice(index, 1);
    Store.findOneAndUpdate(
        { _id: req.store._id },
        { $set: { featured_images } },
        { new: true },
    )
        .exec()
        .then((store) => {
            if (!store) {
                return res.status(500).json({
                    error: 'Store not found',
                });
            }

            return res.json({
                success: 'Remove featured image successfully',
                // store,
            });
        })
        .catch((error) => {
            return res.status(500).json({
                error: errorHandler(error),
            });
        });
};
