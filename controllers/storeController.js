const Store = require('../models/storeModel');
const User = require('../models/userModel');
const fs = require('fs');
const formidable = require('formidable');
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
    const form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, (error, fields, files) => {
        if (error) {
            return res.status(400).json({
                error: 'Photo could not be up load',
            });
        }

        if (files.photo) {
            //check type
            const type = files.photo.type;
            if (
                type !== 'image/png' &&
                type !== 'image/jpg' &&
                type !== 'image/jpeg' &&
                type !== 'image/gif'
            ) {
                return res.status(400).json({
                    error: 'Invalid type. Photo type must be png, jpg, jpeg or gif.',
                });
            }

            //check size
            const size = files.photo.size;
            if (size > 1000000) {
                return res.status(400).json({
                    error: 'Image should be less than 1mb in size',
                });
            }

            const path = files.photo.path;
            let data;
            try {
                data = fs.readFileSync(path);
            } catch (e) {
                return res.status(500).json({
                    error: 'Can not read photo file',
                });
            }

            let newpath = 'public/uploads/store/' + 'avatar-' + req.store.slug;

            //unlink
            const types = ['.png', '.jpg', '.jpeg', '.gif'];
            types.forEach((type) => {
                try {
                    fs.unlinkSync(newpath + type);
                } catch {}
            });

            //write file
            newpath = newpath + '.' + type.replace('image/', '');
            try {
                fs.writeFileSync(newpath, data);
            } catch (e) {
                return res.status(500).json({
                    error: 'Photo could not be up load',
                });
            }

            //save path
            Store.findOneAndUpdate(
                { _id: req.store._id },
                { $set: { avatar: newpath.replace('public', '') } },
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
                        success: 'Update avatar successfully',
                        // store,
                    });
                })
                .catch((error) => {
                    return res.status(500).json({
                        error: errorHandler(error),
                    });
                });
        } else {
            return res.status(400).json({
                error: 'Photo file is not exists',
            });
        }
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
    const form = new formidable.IncomingForm();
    form.keepExtensions = true;
    // form.uploadDir = 'public/uploads/user/';

    form.parse(req, (error, fields, files) => {
        if (error) {
            return res.status(400).json({
                error: 'Photo could not be up load',
            });
        }

        // console.log('---FILES---: ', files.photo);
        if (files.photo) {
            //check type
            const type = files.photo.type;
            if (
                type !== 'image/png' &&
                type !== 'image/jpg' &&
                type !== 'image/jpeg' &&
                type !== 'image/gif'
            ) {
                return res.status(400).json({
                    error: 'Invalid type. Photo type must be png, jpg, jpeg or gif.',
                });
            }

            //check size
            const size = files.photo.size;
            if (size > 1000000) {
                return res.status(400).json({
                    error: 'Image should be less than 1mb in size',
                });
            }

            const path = files.photo.path;
            let data;
            try {
                data = fs.readFileSync(path);
            } catch (e) {
                return res.status(500).json({
                    error: 'Can not read photo file',
                });
            }

            let newpath = 'public/uploads/store/' + 'cover-' + req.store.slug;

            //unlink
            const types = ['.png', '.jpg', '.jpeg', '.gif'];
            types.forEach((type) => {
                try {
                    fs.unlinkSync(newpath + type);
                } catch {}
            });

            //write file
            newpath = newpath + '.' + type.replace('image/', '');
            try {
                fs.writeFileSync(newpath, data);
            } catch (e) {
                return res.status(500).json({
                    error: 'Photo could not be up load',
                });
            }

            //save path
            Store.findOneAndUpdate(
                { _id: req.store._id },
                { $set: { cover: newpath.replace('public', '') } },
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
                        success: 'Update cover successfully',
                        // store,
                    });
                })
                .catch((error) => {
                    return res.status(500).json({
                        error: errorHandler(error),
                    });
                });
        } else {
            return res.status(400).json({
                error: 'Photo file is not exists',
            });
        }
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
        return res.status(400).json({
            error: 'The limit is 6 images',
        });
    }

    const form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, (error, fields, files) => {
        if (error) {
            return res.status(400).json({
                error: 'Photo could not be up load',
            });
        }

        // console.log('---FILES---: ', files.photo);
        if (files.photo) {
            //check type
            const type = files.photo.type;
            if (
                type !== 'image/png' &&
                type !== 'image/jpg' &&
                type !== 'image/jpeg' &&
                type !== 'image/gif'
            ) {
                return res.status(400).json({
                    error: 'Invalid type. Photo type must be png, jpg, jpeg or gif.',
                });
            }

            //check size
            const size = files.photo.size;
            if (size > 1000000) {
                return res.status(400).json({
                    error: 'Image should be less than 1mb in size',
                });
            }

            const path = files.photo.path;
            let data;
            try {
                data = fs.readFileSync(path);
            } catch (e) {
                return res.status(500).json({
                    error: 'Can not read photo file',
                });
            }

            //write file
            let newpath =
                'public/uploads/store/' +
                `feature-${index}-` +
                req.store.slug +
                '.' +
                type.replace('image/', '');

            try {
                fs.writeFileSync(newpath, data);
            } catch (e) {
                return res.status(500).json({
                    error: 'Photo could not be up load',
                });
            }

            //save path
            Store.findOneAndUpdate(
                { _id: req.store._id },
                { $push: { featured_images: newpath.replace('public', '') } },
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
                        success: 'Add featured image successfully',
                        // store,
                    });
                })
                .catch((error) => {
                    return res.status(500).json({
                        error: errorHandler(error),
                    });
                });
        } else {
            return res.status(400).json({
                error: 'Photo file is not exists',
            });
        }
    });
};

exports.updateFeatureImage = (req, res) => {
    let featured_images = req.store.featured_images;
    const index = req.params.imageIndex;
    if (index >= featured_images.length) {
        return res.status(404).json({
            error: 'Feature image not found',
        });
    }

    const form = new formidable.IncomingForm();
    form.keepExtensions = true;
    // form.uploadDir = 'public/uploads/user/';

    form.parse(req, (error, fields, files) => {
        if (error) {
            return res.status(400).json({
                error: 'Photo could not be up load',
            });
        }

        // console.log('---FILES---: ', files.photo);
        if (files.photo) {
            //check type
            const type = files.photo.type;
            if (
                type !== 'image/png' &&
                type !== 'image/jpg' &&
                type !== 'image/jpeg' &&
                type !== 'image/gif'
            ) {
                return res.status(400).json({
                    error: 'Invalid type. Photo type must be png, jpg, jpeg or gif.',
                });
            }

            //check size
            const size = files.photo.size;
            if (size > 1000000) {
                return res.status(400).json({
                    error: 'Image should be less than 1mb in size',
                });
            }

            const path = files.photo.path;
            let data;
            try {
                data = fs.readFileSync(path);
            } catch (e) {
                return res.status(500).json({
                    error: 'Can not read photo file',
                });
            }

            //unlink
            const oldpath = featured_images[index];
            try {
                fs.unlinkSync('public' + oldpath);
            } catch {}

            //write file
            let newpath =
                'public/uploads/store/' +
                `feature-${index}-` +
                req.store.slug +
                '.' +
                type.replace('image/', '');
            try {
                fs.writeFileSync(newpath, data);
            } catch (e) {
                return res.status(500).json({
                    error: 'Photo could not be up load',
                });
            }

            featured_images[index] = newpath.replace('public', '');

            //save path
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
                        success: 'Update feature image successfully',
                        // store,
                    });
                })
                .catch((error) => {
                    return res.status(500).json({
                        error: errorHandler(error),
                    });
                });
        } else {
            return res.status(400).json({
                error: 'Photo file is not exists',
            });
        }
    });
};

exports.removeFeaturedImage = (req, res) => {
    let featured_images = req.store.featured_images;
    const index = req.params.imageIndex;
    if (index >= featured_images.length) {
        return res.status(404).json({
            error: 'Feature image not found',
        });
    }

    if (index == featured_images.length - 1) {
        try {
            fs.unlinkSync('public' + featured_images[index]);
        } catch (e) {
            return res.status(500).json({
                error: 'Remove featured image failed',
            });
        }
    } else {
        for (let i = index - 1; i < featured_images.length - 2; i++) {
            try {
                fs.renameSync(
                    'public' + featured_images[i + 2],
                    'public' + featured_images[i + 1],
                );
            } catch (e) {
                return res.status(500).json({
                    error: 'Remove featured image failed',
                });
            }
        }
    }

    //update db
    featured_images.pop();
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
