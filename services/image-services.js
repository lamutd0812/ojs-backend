const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const config = require('../config/config');
const { getFileNameFromUrl } = require('../utils/utility');

aws.config.update({
    accessKeyId: config.AWS_ACCESS_KEY,
    secretAccessKey: config.AWS_SECRET_KEY,
    region: config.AWS_S3_BUCKET_REGION
});

const s3 = new aws.S3();

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
    ) {
        cb(null, true);
    } else {
        const error = 'Chỉ được upload file dạng .png/.jpg/.jpeg!';
        req.error = error;
        cb(null, false);
    }
};

exports.uploadImage = multer({
    storage: multerS3({
        s3: s3,
        bucket: config.AWS_S3_BUCKET_NAME_IMAGES,
        acl: 'public-read',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            cb(null, Date.now().toString() + '-' + file.originalname);
        }
    }),
    fileFilter: fileFilter
});

exports.deleteImage = (fileUrl) => {
    const params = {
        Bucket: config.AWS_S3_BUCKET_NAME_IMAGES,
        Key: getFileNameFromUrl(fileUrl)
    };

    let result = {
        error: null,
        data: null
    };

    s3.deleteObject(params, (err, data) => {
        if (err) {
            console.log(err, err.stack);
            result.error = err.stack;
        }
        else {
            console.log('image deleted', data);
        }
    });

    return result;
};
