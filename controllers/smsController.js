const User = require('../models/userModel');
const Vonage = require('@vonage/server-sdk');
const { errorHandler } = require('../helpers/errorHandler');

const vonage = new Vonage({
    apiKey: process.env.VONAGE_API_KEY,
    apiSecret: process.env.VONAGE_API_SECRET,
});

exports.sendNotificationSMS = (req, res) => {
    let { phone, title, text, code } = req.msg;
    if (!phone) {
        return res.status(400).json({
            error: 'No phone provided!',
        });
    }

    const from = 'GoodDeal';
    const to = '84' + phone.slice(1);
    text = code ? ` Your CODE: ${code}` : '';

    vonage.message.sendSms(from, to, text, (err, responseData) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                error: 'Send SMS failed',
            });
        } else {
            if (responseData.messages[0]['status'] === '0') {
                return res.json({
                    success: 'Send SMS successfully',
                });
            } else {
                console.log(
                    `---SEND SMS FAILED---: ${responseData.messages[0]['status']}`,
                );
                return res.status(500).json({
                    error: 'Send SMS failed',
                });
            }
        }
    });
};

exports.sendConfirmationSMS = (req, res) => {
    if (req.user.phone) {
        if (req.user.isPhoneActive) {
            return res.status(400).json({
                error: 'User phone number is confirmed',
            });
        }

        vonage.verify.request(
            {
                number: '84' + req.user.phone.slice(1),
                brand: 'GOODDEAL',
            },
            (err, result) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({
                        error: 'Send SMS failed',
                    });
                } else {
                    console.log('---RESULT SEND SMS---: ', result);

                    User.findOneAndUpdate(
                        { _id: req.user._id },
                        { $set: { phone_code: result.request_id } },
                        { new: true },
                    )
                        .exec()
                        .then((user) => {
                            if (!user) {
                                return res.status(500).json({
                                    error: 'User not found',
                                });
                            }

                            return res.json({
                                success: 'Send SMS successfully',
                            });
                        })
                        .catch((error) => {
                            return res.status(500).json({
                                error: errorHandler(error),
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
                    return res.status(500).json({
                        error: 'Send SMS failed',
                    });
                } else {
                    console.log('---RESULT VERIFY SMS---: ', result);

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
                                return res.status(500).json({
                                    error: 'User not found',
                                });
                            }

                            return res.json({
                                success: 'Confirm SMS successfully',
                            });
                        })
                        .catch((error) => {
                            return res.status(500).json({
                                error: errorHandler(error),
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
