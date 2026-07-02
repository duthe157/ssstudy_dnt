const fs = require('fs');
const AWS = require('aws-sdk');

const cf = require('../../config/config');
AWS.config.update({
    accessKeyId: cf.AMAZON.S3.ACESS_KEY,
    secretAccessKey: cf.AMAZON.S3.SECURITY_KEY,
    region: cf.AMAZON.S3.REGION,
    endpoint: cf.AMAZON.S3.ENDPOINT,
    apiVersions: {
        s3: '2006-03-01'
    }
});

async function upFileToS3(uploadParams) {
    return new Promise(((resolve, reject) => {
        try {
            const s3 = new AWS.S3();
            s3.upload(uploadParams, (err, data) => {
                if (err)
                    resolve(false);
                if (data) {
                    resolve(true);
                }
            });
        } catch (er) {logError(er);
            resolve(false);
        }
    }));
}

class AwsService {
    async s3Upfile(pathClient, pathS3, ContentType) {
        try {
            const uploadParams = {
                Bucket: cf.AMAZON.S3.BUCKET,
                ContentType: ContentType,
                Key: '',
                Body: ''
            };
            const fileStream = fs.createReadStream(pathClient);
            fileStream.on('error', (err) => {
            });
            uploadParams.Body = fileStream;
            uploadParams.Key = pathS3;
            const flag = await upFileToS3(uploadParams);
            return flag;
        } catch (err) {
            throw err;
        }
    }


    async downFileS3(path) {
        return new Promise((resolve, reject) => {
            try {
                const s3 = new AWS.S3();
                const getParams = {
                    Bucket: cf.AMAZON.S3.BUCKET,
                    Key: path
                };
                s3.getObject(getParams, (err, data) => {
                    if (err)
                        resolve(err);
                    if (data) {
                        resolve(data);
                    }
                });
            } catch (err) {
                logStack(err);
                reject(err);
            }
        });
    }

    async s3LoadContentJsonFile(path, bucketName) {
        try {
            return new Promise(((resolve) => {
                try {
                    const s3 = new AWS.S3();
                    const getParams = {
                        Bucket: bucketName,
                        Key: path
                    };
                    s3.getObject(getParams, (err, data) => {
                        if (err)
                            resolve(false);
                        if (data) {
                            const objectData = data.Body.toString('utf-8');
                            const json = JSON.parse(objectData);
                            resolve(json);
                        }
                    });
                } catch (err) {
                    logStack(err);
                    reject(err);
                }
            }));
        } catch (err) {
            logStack(err);
            reject(err);
        }
    }
}

module.exports = new AwsService();
