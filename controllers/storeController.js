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
    store.proceeds = undefined;

    return res.json({
        success: 'Get store successfully',
        store,
    });
};

exports.getStoreByUser = (req, res) => {
    Store.findOne({
        $or: [{ ownerId: req.user._id }, { staffIds: req.user._id }],
    })
        .populate(
            'ownerId',
            '_id firstname lastname slug email phone id_card point avatar cover',
        )
        .populate(
            'staffIds',
            '_id firstname lastname slug email phone id_card point avatar cover',
        )
        .exec()
        .then((store) => {
            if (!store) {
                return res.status(404).json({
                    error: 'Store not found',
                });
            }

            if (store.ownerId.email)
                store.ownerId.email =
                    store.ownerId.email.slice(0, 6) + '******';
            if (store.ownerId.phone)
                store.ownerId.phone = '*******' + store.ownerId.phone.slice(-3);
            if (store.ownerId.id_card)
                store.ownerId.id_card =
                    store.ownerId.id_card.slice(0, 3) + '******';

            store.staffIds.forEach((s) => {
                if (s.email) s.email = s.email.slice(0, 6) + '******';
                if (s.phone) s.phone = '*******' + s.phone.slice(-3);
                if (s.id_card) s.id_card = s.id_card.slice(0, 3) + '******';
            });

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

exports.createStore = (req, res, next) => {
    const { name, bio, commission } = req.body;
    const store = new Store({ name, bio, commission, ownerId: req.user._id });
    store.save((error, store) => {
        if (error | !store) {
            return res.status(400).json({
                error: errorHandler(error),
            });
        }

        //upgrade role
        req.changeRole = {
            users: [req.user._id],
            isUpgraded: true,
        };
        next();
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
            return res.status(400).json({
                error: errorHandler(error),
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
            return res.status(400).json({
                error: errorHandler(error),
            });
        });
};

/*------
  COMMISSION
  ------*/
exports.updateCommission = (req, res) => {
    const { commission } = req.body;

    Store.findOneAndUpdate({ _id: req.store._id }, { $set: { commission } })
        .exec()
        .then((store) => {
            if (!store) {
                return res.status(500).json({
                    error: 'Store not found',
                });
            }

            return res.json({
                success: 'Update store commission successfully',
            });
        })
        .catch((error) => {
            return res.status(400).json({
                error: errorHandler(error),
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
            return res.status(400).json({
                error: errorHandler(error),
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

            return res.status(400).json({
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
            return res.status(400).json({
                error: errorHandler(error),
            });
        });
};

/*------
  OWNER
  ------*/
exports.getOwner = (req, res) => {
    Store.findOne({ _id: req.store._id })
        .select('ownerId')
        .populate(
            'ownerId',
            '_id firstname lastname slug email phone id_card point avatar cover',
        )
        .exec()
        .then((store) => {
            if (!store) {
                return res.status(500).json({
                    error: 'Store not found',
                });
            }

            if (store.ownerId.email)
                store.ownerId.email =
                    store.ownerId.email.slice(0, 6) + '******';
            if (store.ownerId.phone)
                store.ownerId.phone = '*******' + store.ownerId.phone.slice(-3);
            if (store.ownerId.id_card)
                store.ownerId.id_card =
                    store.ownerId.id_card.slice(0, 3) + '******';

            return res.json({
                success: 'Get owner successfully',
                owner: store.ownerId,
            });
        })
        .catch((error) => {
            return res.status(500).json({
                error: 'Get owner failed',
            });
        });
};

/*------
  STAFFS
  ------*/
exports.listStaffs = (req, res) => {
    Store.findOne({ _id: req.store._id })
        .select('staffIds')
        .populate(
            'staffIds',
            '_id firstname lastname slug email phone id_card point avatar cover',
        )
        .exec()
        .then((store) => {
            if (!store) {
                return res.status(500).json({
                    error: 'Store not found',
                });
            }

            store.staffIds.forEach((s) => {
                if (s.email) s.email = s.email.slice(0, 6) + '******';
                if (s.phone) s.phone = '*******' + s.phone.slice(-3);
                if (s.id_card) s.id_card = s.id_card.slice(0, 3) + '******';
            });

            return res.json({
                success: 'Load list staffs successfully',
                staffs: store.staffIds,
            });
        })
        .catch((error) => {
            return res.status(500).json({
                error: 'Load list staffs failed',
            });
        });
};

exports.addStaffs = (req, res, next) => {
    const { staffs } = req.body;

    User.countDocuments(
        { _id: { $in: staffs }, role: 'customer' },
        (error, count) => {
            if (error) {
                return res.status(404).json({
                    error: 'Users not found',
                });
            }

            if (count != staffs.length) {
                return res.status(400).json({
                    error: 'Users is invalid',
                });
            }

            let staffIds = req.store.staffIds;
            staffIds.push(...staffs);
            staffIds = [...new Set(staffIds)];

            Store.findOneAndUpdate(
                { _id: req.store._id },
                { $set: { staffIds: staffIds } },
            )
                .exec()
                .then((store) => {
                    if (!store) {
                        return res.status(500).json({
                            error: 'Store not found',
                        });
                    }

                    //upgrade role
                    req.changeRole = {
                        users: staffs,
                        isUpgraded: true,
                    };
                    next();
                })
                .catch((error) => {
                    return res.status(400).json({
                        error: errorHandler(error),
                    });
                });
        },
    );
};

exports.cancelStaff = (req, res, next) => {
    const userId = req.user._id;
    let staffIds = req.store.staffIds;

    const index = staffIds.indexOf(userId);
    if (index == -1) {
        return res.status(400).json({
            error: 'User is not staff',
        });
    }

    staffIds.splice(index, 1);
    Store.findOneAndUpdate(
        { _id: req.store._id },
        { $set: { staffIds: staffIds } },
    )
        .exec()
        .then((store) => {
            if (!store) {
                return res.status(500).json({
                    error: 'Store not found',
                });
            }

            //downgrade role
            req.changeRole = {
                users: [userId],
                isUpgraded: false,
            };
            next();
        })
        .catch((error) => {
            return res.status(400).json({
                error: errorHandler(error),
            });
        });
};

exports.removeStaff = (req, res, next) => {
    const { staff } = req.body;
    if (!staff) {
        return res.status(400).json({
            error: 'Staff is required',
        });
    }

    let staffIds = req.store.staffIds;
    const index = staffIds.indexOf(staff);
    console.log(index);
    if (index == -1) {
        return res.status(400).json({
            error: 'User is not staff',
        });
    }

    staffIds.splice(index, 1);
    Store.findOneAndUpdate(
        { _id: req.store._id },
        { $set: { staffIds: staffIds } },
    )
        .exec()
        .then((store) => {
            if (!store) {
                return res.status(500).json({
                    error: 'Store not found',
                });
            }

            //downgrade role
            req.changeRole = {
                users: [staff],
                isUpgraded: false,
            };
            next();
        })
        .catch((error) => {
            return res.status(400).json({
                error: errorHandler(error),
            });
        });
};

/*------
  FOLLOWERS
  ------*/
exports.updateNumberOfFollowers = (req, res) => {
    let numberOfFollowers = req.store.number_of_followers;
    numberOfFollowers = numberOfFollowers + req.updateNumberOfFollowers;

    Store.findOneAndUpdate(
        { _id: req.store._id },
        { $set: { number_of_followers: numberOfFollowers } },
    )
        .exec()
        .then((store) => {
            if (!store) {
                return res.status(500).json({
                    error: 'Store not found',
                });
            }

            return res.json({
                success: 'Update follow successfully',
            });
        })
        .catch((error) => {
            return res.status(500).json({
                error: 'Update follow failed',
            });
        });
};

/*------
  LIST STORES
  ------*/
exports.listStoreCommissions = (req, res, next) => {
    Store.distinct('commission', {}, (error, commissions) => {
        if (error) {
            return res.status(400).json({
                error: 'Commissions not found',
            });
        }

        req.loadedCommissions = commissions;
        next();
    });
};

//?search=...&sortBy=...&order=...&limit=...&commission=...&isActive=...&page=...
exports.listStores = (req, res) => {
    const search = req.query.search ? req.query.search : '';
    let isActive = [true, false];
    if (req.query.isActive == 'true') isActive = [true];
    if (req.query.isActive == 'false') isActive = [false];

    const sortBy = req.query.sortBy ? req.query.sortBy : '_id';
    const order =
        req.query.order &&
        (req.query.order == 'asc' || req.query.order == 'desc')
            ? req.query.order
            : 'asc';

    const limit =
        req.query.limit && req.query.limit > 0 ? parseInt(req.query.limit) : 6;
    const page =
        req.query.page && req.query.page > 0 ? parseInt(req.query.page) : 1;
    const skip = limit * (page - 1);

    const commission = req.query.commission
        ? [req.query.commission]
        : req.loadedCommissions;

    const filter = {
        search,
        sortBy,
        order,
        isActive,
        commission,
        limit,
        pageCurrent: page,
    };

    const filterArgs = {
        name: { $regex: search, $options: 'i' },
        isActive: { $in: isActive },
        commission: { $in: commission },
    };

    Store.countDocuments(filterArgs, (error, count) => {
        if (error) {
            return res.status(404).json({
                error: 'Stores not found',
            });
        }

        const size = count;
        const pageCount = Math.ceil(size / limit);
        filter.pageCount = pageCount;

        Store.find(filterArgs)
            .select('-e_wallet')
            .sort([[sortBy, order]])
            .skip(skip)
            .limit(limit)
            .populate(
                'ownerId',
                '_id firstname lastname slug email phone id_card point avatar cover',
            )
            .populate(
                'staffIds',
                '_id firstname lastname slug email phone id_card point avatar cover',
            )
            .exec()
            .then((stores) => {
                return res.json({
                    success: 'Load list stores successfully',
                    filter,
                    size,
                    stores,
                });
            });
    });
};
