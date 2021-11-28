const Transaction = require('../models/transaction');
const User = require('../models/user');
const Store = require('../models/store');
const { cleanUserLess } = require('../helpers/userHandler');
const { errorHandler } = require('../helpers/errorHandler');

exports.transactionById = (req, res, next, id) => {
    Transaction.findById(id, (error, transaction) => {
        if (error || !transaction) {
            return res.status(404).json({
                error: 'Transaction not found',
            });
        }

        req.transaction = transaction;
        next();
    });
};

exports.readTransaction = (req, res) => {
    Transaction.findOne({ _id: req.transaction._id })
        .populate('userId', '_id firstname lastname avatar')
        .populate('storeId', '_id name avatar isOpen isActive')
        .exec()
        .then((transaction) => {
            if (!transaction)
                return res.status(500).json({
                    error: 'Transaction not found',
                });
            return res.json({
                success: 'Read transaction successfully',
                transaction,
            });
        })
        .catch((error) => {
            return res.status(500).json({
                error: 'Transaction not found',
            });
        });
};

exports.requestTransaction = (req, res, next) => {
    const { isUp, code, amount } = req.body;
    if ((!req.store && !req.user) || typeof isUp !== 'boolean' || !amount)
        return res.status(400).json({
            error: 'All fields are required',
        });
    else {
        req.createTransaction = {
            isUp,
            code,
            amount,
        };
        if (!req.store && req.user) req.createTransaction.userId = req.user._id;
        else req.createTransaction.storeId = req.store._id;

        next();
    }
};

exports.updateEWallet = (req, res, next) => {
    const { userId, storeId, isUp, code, amount } = req.createTransaction;
    if ((!userId && !storeId) || typeof isUp !== 'boolean' || !amount)
        return res.status(400).json({
            error: 'All fields are required!',
        });

    let args = {};
    if (isUp) args = { $inc: { e_wallet: +amount } };
    else args = { $inc: { e_wallet: -amount } };

    if (userId)
        User.findOneAndUpdate({ _id: userId }, args, { new: true })
            .exec()
            .then((user) => {
                if (!user)
                    return res.status(500).json({
                        error: 'User not found',
                    });

                next();
            })
            .catch((error) => {
                return res.status(500).json({
                    error: 'Update user e_wallet failed',
                });
            });
    else
        Store.findOneAndUpdate({ _id: storeId }, args, { new: true })
            .exec()
            .then((store) => {
                if (!store)
                    return res.status(500).json({
                        error: 'Store not found',
                    });

                next();
            })
            .catch((error) => {
                return res.status(500).json({
                    error: 'Update store e_wallet failed',
                });
            });
};

exports.createTransaction = (req, res, next) => {
    const { userId, storeId, isUp, code, amount } = req.createTransaction;
    if ((!userId && !storeId) || typeof isUp !== 'boolean' || !amount)
        return res.status(400).json({
            error: 'All fields are required!',
        });

    const transaction = new Transaction({
        userId,
        storeId,
        isUp,
        code,
        amount,
    });
    transaction.save((error, transaction) => {
        if (error || !transaction)
            return res.status(500).json({
                error: errorHandler(error),
            });
        if (next) next();
        else {
            if (storeId)
                Store.findOne({
                    _id: req.store._id,
                })
                    .populate('ownerId')
                    .populate('staffIds')
                    .populate('commissionId', '_id name cost')
                    .exec()
                    .then((store) => {
                        if (!store) {
                            return res.status(404).json({
                                error: 'Create transaction successfully, but Stores not found',
                            });
                        }

                        store.ownerId = cleanUser(store.ownerId);
                        store.staffIds.forEach((staff) => {
                            staff = cleanUser(staff);
                        });

                        return res.status(500).json({
                            success: 'Create transaction successfully',
                            store,
                        });
                    })
                    .catch((error) => {
                        return res.status(404).json({
                            error: 'Create transaction successfully, but Store not found',
                        });
                    });
            else
                return res.status(500).json({
                    success: 'Create transaction successfully',
                    user: cleanUserLess(req.user),
                });
        }
    });
};

exports.listTransactions = (req, res) => {
    const sortBy = req.query.sortBy ? req.query.sortBy : 'createdAt';
    const order =
        req.query.order &&
        (req.query.order == 'asc' || req.query.order == 'desc')
            ? req.query.order
            : 'desc';

    const limit =
        req.query.limit && req.query.limit > 0 ? parseInt(req.query.limit) : 6;
    const page =
        req.query.page && req.query.page > 0 ? parseInt(req.query.page) : 1;
    let skip = limit * (page - 1);

    const filter = {
        sortBy,
        order,
        limit,
        pageCurrent: page,
    };

    let filterArgs = {};
    if (!req.store && !req.user)
        return res.status(404).json({
            error: 'List transactions not found',
        });

    if (!req.store && req.user && req.user.role === 'user')
        filterArgs = { userId: req.user._id };
    if (req.store) filterArgs = { storeId: req.store._id };

    Transaction.countDocuments(filterArgs, (error, count) => {
        if (error) {
            return res.status(404).json({
                error: 'List transactions not found',
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
                success: 'Load list transactions successfully',
                filter,
                size,
                orders: [],
            });
        }

        Transaction.find(filterArgs)
            .sort({ [sortBy]: order, _id: 1 })
            .skip(skip)
            .limit(limit)
            .populate('userId', '_id name avatar')
            .populate('storeId', '_id name avatar isActive isOpen')
            .exec()
            .then((transactions) => {
                return res.json({
                    success: 'Load list transactions successfully',
                    filter,
                    size,
                    transactions,
                });
            })
            .catch((error) => {
                return res.status(500).json({
                    error: 'Load list transactions failed',
                });
            });
    });
};
