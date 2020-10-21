require('dotenv').config();

module.exports = {
    'DB_URI': `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0-rkh3t.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
    'JWT_SECRET' : `${process.env.JWT_SECRET}`,
    'AWS_ACCESS_KEY': `${process.env.AWS_AccessKeyId}`,
    'AWS_SECRET_KEY': `${process.env.AWS_SecretKey}`,
    'AWS_S3_BUCKET_REGION': `${process.env.AWS_S3_Bucket_Region}`,
    'AWS_S3_BUCKET_NAME': `${process.env.AWS_S3_Bucket_Name}`
};