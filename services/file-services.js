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
        file.mimetype === 'application/pdf' ||
        file.mimetype === 'application/msword' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

exports.uploadFile = multer({
    storage: multerS3({
        s3: s3,
        bucket: config.AWS_S3_BUCKET_NAME,
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

exports.deleteFile = (fileUrl) => {
    const params = {
        Bucket: config.AWS_S3_BUCKET_NAME,
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
            console.log('object deleted', data);
        }
    });

    return result;
};
