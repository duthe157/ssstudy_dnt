const fs = require('fs');
const config = require('../../config/config');
const appConfig = require('../../config/app');
const BaseHelper = require('../helpers/BaseHelper');
const FileModel = require('../models/File');
const AwsService = require('./AwsService');

class AppService {
    async addFile(user, files, object, multiple = false, type = 'IMAGE', savedb = true) {
        try {
            const date = new Date();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            const year = date.getFullYear();
            const rootPath = appConfig.LOCAL.DIR_TEMP + '/' + object + '/' + year + month + day + '/';
            const mediaRootURL = object + '/' + year + month + day;
            await BaseHelper.createFolderFull(rootPath);

            let mediaURL = null;
            let newFullPath = null;
            const arrFile = [];
            for (let i = 0; i < files.length; i++) {
                const fileObject = files[i].originalname.split('.');
                const ext = fileObject[1];
                let fileName = fileObject[0];
                fileName = BaseHelper.seoURL(fileName) + '-' + Date.now();
                mediaURL = mediaRootURL + '/' + fileName + '.' + ext;
                files[i].filename = fileName + '.' + ext;
                files[i].file_url = mediaURL;
                const fullPathInServ = files[i].path;
                newFullPath = rootPath + '/' + files[i].filename;
                files[i].full_path = newFullPath;
                await fs.renameSync(fullPathInServ, newFullPath);

                try {

                    setTimeout(async function () {
                        await AwsService.s3Upfile(newFullPath, mediaURL, files[i].mimetype);
                    }, 5000);
                } catch (err) {
                    logError(err);
                }

                if (fs.existsSync(newFullPath)) {
                    arrFile.push(files[i]);
                    if (savedb) {
                        const alias = BaseHelper.seoURL(files[i].originalname);
                        const fileData = {
                            creator_id: user.user_id,
                            name: files[i].originalname,
                            alias: alias,
                            path: mediaURL,
                            object: object,
                            type: type,
                            size: files[i].size,
                            tags: []
                        };
                        await FileModel.create(fileData);
                    }
                }
            }

            return arrFile;
        } catch (err) {
            logError(err);
        }
    }

    async removeFile(files) {
        try {
            for (let i = 0; i < files.length; i++) {
                fs.unlink(files[i].full_path, (err) => {
                    if (err)
                        logError(err);
                });
            }
        } catch (err) {
            logError(err);
        }
    }

    async upload(data, type, object) {
        try {
            const fileData = [];
            const s3RootPath = object + '/' + BaseHelper.getUploadFolder();
            const fileName = BaseHelper.generateTime() + '-' + BaseHelper.generateText(10);
            if (type === 'base64') {
                const file = await BaseHelper.base64ToImage(data, appConfig.LOCAL.DIR_TEMP, fileName);
                if (!file)
                    return false;

                const pathClient = file.path;
                const pathS3 = s3RootPath + '/' + fileName.toLowerCase() + file.ext;
                const flag = await AwsService.s3Upfile(pathClient, pathS3, file.mimetype);
                if (flag)
                    fileData.push(pathS3);
            } else {
                const files = data;
                for (let i = 0; i < files.length; i++) {
                    const fileObject = files[i].originalname.split('.');
                    const ext = fileObject[1];
                    const pathS3 = s3RootPath + '/' + fileName.toLowerCase() + i + '.' + ext;
                    const fullPathInServ = files[i].path;
                    const newFullPath = appConfig.LOCAL.DIR_TEMP + '' + fileName.toLowerCase() + i + '.' + ext;
                    const isRename = await this.renameFile(fullPathInServ, newFullPath);
                    if (isRename) {
                        const pathClient = newFullPath;
                        const flag = await AwsService.s3Upfile(pathClient, pathS3, files[i].mimetype);
                        if (flag)
                            fileData.push(pathS3);
                    }
                }
            }

            if (fileData.length > 0)
                return fileData;
            return false;
        } catch (err) {
            logError(err);
            return false;
        }
    }

    async renameFile(fullPathInServ, newFullPath) {
        try {
            await fs.renameSync(fullPathInServ, newFullPath);
            return true;
        } catch (err) {
            logError(err);
            return false;
        }
    }
}

module.exports = new AppService();

