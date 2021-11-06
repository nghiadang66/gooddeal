const Product = require('../models/product');
const { errorHandler } = require('../helpers/errorHandler');

exports.productById = (req, res, next, id) => {
    Product.findById(id, (error, product) => {
        if (error || !product) {
            return res.status(404).json({
                error: 'Product not found',
            });
        }

        req.product = product;
        next();
    });

    // .populate('categoryId')
    //     .populate('styleValueIds')
    //     .populate('storeId', '_id name avatar isActive isOpen')
}

exports.createProduct = (req, res) => {
    const { name, description, price, promotionalPrice, quantity, sold, categoryId, styleValueIds } = req.fields;
    const listImages = req.filepaths;

    if (!name || !description || !price || !promotionalPrice || !quantity || !sold || !categoryId || !listImages || listImages.length <= 0) {
        try {
            listImages.forEach(image => {
                fs.unlinkSync('public' + image);
            });
        } catch { }

        return res.status(400).json({
            error: 'All fields are required',
        });
    }

    const product = new Product({
        name, description, price, promotionalPrice, quantity, sold, categoryId, styleValueIds,
        isActive: req.store.isActive, listImages,
    });

    product.save((error, product) => {
        if (error || !product) {
            try {
                listImages.forEach(image => {
                    fs.unlinkSync('public' + image);
                });
            } catch { }

            return res.status(400).json({
                error: errorHandler(error),
            });
        }

        return res.json({
            success: 'Creating product successfully',
            product,
        });
    });
}

exports.updateProduct = (req, res) => {
    const { name, description, price, promotionalPrice, quantity, sold, categoryId, styleValueIds } = req.fields;

    if (!name || !description || !price || !promotionalPrice || !quantity || !sold || !categoryId) {
        return res.status(400).json({
            error: 'All fields are required',
        });
    }

    Product.findOneAndUpdate(
        { _id: req.product._id },
        {
            name, description, price, promotionalPrice, quantity, sold, categoryId, styleValueIds,
        }
    )
        .exec()
        .populate('categoryId')
        .populate('styleValueIds')
        .populate('storeId', '_id name avatar isActive isOpen')
        .then(product => {
            if (!product)
                return res.status(500).json({
                    error: 'Product not found',
                });

            return res.json({
                success: 'Update product successfully',
                product,
            });

        })
        .catch(error => {
            return res.status(400).json({
                error: errorHandler(error),
            });
        });
}

/*------
  ACTIVE
  ------*/
exports.activeAllProduct = (req, res) => {
    const { isActive } = req.body;

    Product.updateMany(
        { storeId: req.store._id },
        { $set: { isActive } },
        { new: true },
    )
        .exec()
        .then(() => {
            return res.json({
                success: 'Active/InActive store & products successfully',
                store: req.store,
            });
        })
        .catch((error) => {
            return res.status(400).json({
                error: errorHandler(error),
            });
        });
};

/*------
  SELL OR STORAGE
  ------*/
exports.sellingProduct = (req, res) => {
    const { isSelling } = req.body;

    Product.findOneAndUpdate(
        { _id: req.product._id },
        { $set: { isSelling } },
        { new: true },
    )
        .populate('categoryId')
        .populate('styleValueIds')
        .populate('storeId', '_id name avatar isActive isOpen')
        .exec()
        .then((product) => {
            if (!product) {
                return res.status(404).json({
                    error: 'product not found',
                });
            }

            return res.json({
                success: 'Update product status successfully',
                product,
            });
        })
        .catch((error) => {
            return res.status(400).json({
                error: errorHandler(error),
            });
        });
};