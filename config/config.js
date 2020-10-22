require('dotenv').config();

module.exports = {
    'DB_URI': `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.DB_NAME}`,
    'JWT_SECRET' : `${process.env.JWT_SECRET}`,
    'AWS_ACCESS_KEY': `${process.env.AWS_AccessKeyId}`,
    'AWS_SECRET_KEY': `${process.env.AWS_SecretKey}`,
    'AWS_S3_BUCKET_REGION': `${process.env.AWS_S3_Bucket_Region}`,
    'AWS_S3_BUCKET_NAME': `${process.env.AWS_S3_Bucket_Name}`
};