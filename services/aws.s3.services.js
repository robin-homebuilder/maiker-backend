const { S3Client, PutObjectCommand, ListObjectsCommand, DeleteObjectsCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const dotenv = require('dotenv');
dotenv.config();

const bucketName = process.env.BUCKET_NAME;
const region = process.env.BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

const s3Client = new S3Client({
    region,
    credentials: {
        accessKeyId,
        secretAccessKey
    }
});

exports.uploadFileToS3 = async (data) => {
    const buffer = data.fileBuffer;
    const key = data.imageKey;
    const mimeType = data.mimeType;
    
    const uploadParams = {
        Bucket: bucketName,
        Body: buffer,
        Key: key,
        ContentType: mimeType,
        ACL: 'public-read'
    }
    
    try {
        const data = await s3Client.send(new PutObjectCommand(uploadParams));
        
        return data;
    } catch(err){
        console.log("Error fetching image: ", err)
    }
}

exports.deleteWholeFolder = async (path) => {
    const params = {
        Bucket: bucketName,
        Prefix: path
    };

    try {
        const data = await s3Client.send(new ListObjectsCommand(params));
        
        if (data.Contents.length === 0) {
            return false;
        } else {
            const items = data.Contents.map(item => ({ Key: item.Key }));
            
            const deleteParams = {
                Bucket: bucketName,
                Delete: {
                    Objects: items
                }
            };
    
            await s3Client.send(new DeleteObjectsCommand(deleteParams));
            return true;
        }
    } catch (err) {
        return err;
    }
}