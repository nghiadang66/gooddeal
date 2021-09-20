const fs = require('fs');
const formidable = require('formidable');

exports.upload = (req, res, next) => {
    const form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, (error, fields, files) => {
        if (error) {
            return res.status(400).json({
                error: 'Photo could not be up load',
            });
        }

        if (files.photo) {
            // console.log(files.photo);

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

            const newpath =
                'public/uploads/' +
                Date.now() +
                `${req.store && req.store.slug ? req.store.slug : ''}` +
                `${req.product && req.product.slug ? req.product.slug : ''}` +
                files.photo.name;

            try {
                fs.writeFileSync(newpath, data);
            } catch (e) {
                return res.status(500).json({
                    error: 'Photo could not be up load',
                });
            }

            req.filepath = newpath.replace('public', '');
            next();
        }
    });
};
