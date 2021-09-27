const Slug = require('../models/slugModel');
const { errorHandler } = require('../helpers/errorHandler');

// exports.createSlug = (req, res, next) => {
//     console.log('---CREATE SLUG---');
//     const { slug, id, ref } = req.newSlug;

//     const newSlug = new Slug({ slug, id, ref });
//     newSlug.save((error, slug) => {
//         if (error || !slug) {
//             console.log('---CREATE SLUG FAILED---');
//             return res.status(400).json({
//                 error: errorHandler(error),
//             });
//         }

//         console.log('---CREATE SLUG SUCCESSFULLY---');
//         next();
//         // return res.json({
//         //     success: 'Create slug successfully'
//         // });
//     });
// }

exports.createSlug = (req, res, next) => {
    console.log('---CREATE SLUG---');
    const { slug, id, ref } = req.newSlug;
    Slug.find({ id, ref })
        .exec()
        .then((slugs) => {
            if (slugs.length >= 2) {
                const days =
                    (slugs[1].createdAt.getTime() - new Date().getTime()) /
                    (1000 * 3600 * 24);
                if (days < 14) {
                    console.log(
                        `---CREATE SLUG FAILED---: Can create new slug after ${
                            14 - days
                        } days`,
                    );
                    // return res.status(400).json({
                    //     error: `Can create new slug after ${14 - days} days`,
                    // });
                } else {
                    const newSlug = new Slug({ slug, id, ref });
                    newSlug.save((error, slug) => {
                        if (error || !slug) {
                            console.log('---CREATE SLUG FAILED---');
                            // return res.status(400).json({
                            //     error: errorHandler(error),
                            // });
                        } else {
                            console.log('---CREATE NEW SLUG SUCCESSFULLY---');
                            next();
                            Slug.deleteOne({ _id: slugs[0]._id })
                                .exec()
                                .then(() => {
                                    console.log('---REMOVE OLD SLUG FAILED---');
                                    // return res.json({
                                    //     success: 'Create new slug (remove old slug) successfully',
                                    // });
                                })
                                .catch((error) => {
                                    console.log(
                                        '---REMOVE OLD SLUG SUCCESSFULLY---',
                                    );
                                    // return res.json({
                                    //     success: 'Create new slug successfully (but remove old failed)',
                                    // });
                                });
                        }
                    });
                }
            } else {
                const newSlug = new Slug({ slug, id, ref });
                newSlug.save((error, slug) => {
                    if (error || !slug) {
                        console.log('---CREATE SLUG FAILED---');
                        // return res.status(400).json({
                        //     error: errorHandler(error),
                        // });
                    }
                    console.log('---CREATE SLUG SUCCESSFULLY---');
                    // return res.json({
                    //     success: 'Create new slug successfully',
                    // });
                    next();
                });
            }
        });
};

exports.userIdBySlug = (req, res, next, slug) => {
    Slug.findOne({ slug: slug, ref: 'user' })
        .exec()
        .then((slug) => {
            if (!slug) {
                return res.status(404).json({
                    error: 'Slug not found',
                });
            }

            req.userId = slug.id;
            next();
        })
        .catch((error) => {
            return res.status(404).json({
                error: 'Slug not found',
            });
        });
};

exports.storeIdBySlug = (req, res, next, slug) => {
    Slug.findOne({ slug: slug, ref: 'store' })
        .exec()
        .then((slug) => {
            if (!slug) {
                return res.status(404).json({
                    error: 'Slug not found',
                });
            }

            req.storeId = slug.id;
            next();
        })
        .catch((error) => {
            return res.status(404).json({
                error: 'Slug not found',
            });
        });
};

exports.productIdBySlug = (req, res, next, slug) => {
    Slug.findOne({ slug: slug, ref: 'product' })
        .exec()
        .then((slug) => {
            if (!slug) {
                return res.status(404).json({
                    error: 'Slug not found',
                });
            }

            req.productId = slug.id;
            next();
        })
        .catch((error) => {
            return res.status(404).json({
                error: 'Slug not found',
            });
        });
};
