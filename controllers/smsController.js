const User = require('../models/userModel');
const Vonage = require('@vonage/server-sdk');

const vonage = new Vonage({
    apiKey: '628eebed',
    apiSecret: '6NuYHGafS4oI65OR',
});

exports.sendConfirmationSMS = (req, res) => {
    if (req.user.phone) {
        vonage.verify.request(
            {
                number: '84' + req.user.phone.slice(1),
                brand: 'GOODDEAL',
            },
            (err, result) => {
                if (err) {
                    console.error(err);
                    return res.status(400).json({
                        error: 'Send SMS failed',
                    });
                } else {
                    console.log('---RESULT---: ', result);

                    User.findOneAndUpdate(
                        { _id: req.user._id },
                        {
                            $set: {
                                phone_code: result.request_id,
                                isPhoneActive: false,
                            },
                        },
                        { new: true },
                    )
                        .exec()
                        .then((user) => {
                            if (!user) {
                                return res.status(404).json({
                                    error: 'User not found',
                                });
                            }

                            return res.json({
                                success: 'Send SMS successfully',
                            });
                        })
                        .catch((error) => {
                            return res.status(404).json({
                                error: 'User not found',
                            });
                        });
                }
            },
        );
    } else {
        return res.status(400).json({
            error: 'No phone provided!',
        });
    }
};

exports.verifySMS = (req, res) => {
    if (req.user.phone_code && req.params.phoneCode) {
        vonage.verify.check(
            {
                request_id: req.user.phone_code,
                code: req.params.phoneCode,
            },
            (err, result) => {
                if (err) {
                    console.error(err);
                    return res.status(400).json({
                        error: 'Send SMS failed',
                    });
                } else {
                    console.log('---RESULT---: ', result);

                    User.findOneAndUpdate(
                        { _id: req.user._id },
                        {
                            $set: { isPhoneActive: true },
                            $unset: { phone_code: '' },
                        },
                    )
                        .exec()
                        .then((user) => {
                            if (!user) {
                                return res.status(404).json({
                                    error: 'User not found',
                                });
                            }

                            return res.json({
                                success: 'Confirm SMS successfully',
                            });
                        })
                        .catch((error) => {
                            return res.status(404).json({
                                error: 'User not found',
                            });
                        });
                }
            },
        );
    } else {
        return res.status(400).json({
            error: 'No phone code provided!',
        });
    }
};
