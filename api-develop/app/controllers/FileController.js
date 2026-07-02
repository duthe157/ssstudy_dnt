const cf = require('../../config/config');
const BaseHelper = require('../helpers/BaseHelper');
const UploadService = require('../services/UploadService');

const language = BaseHelper.fileToJSON(`${__dirname}/../languages/vi.json`);

class FileController {
    async upload(req, res, params) {
        try {
            const folder = params.folder || 'files';
            const { files } = req;
            let url = null;
            if (files) {
                const fileData = await UploadService.upload(files, 'binary', folder);
                if (fileData && fileData[0])
                    url = cf.FILE_DOMAIN + '/' + fileData[0];uplo
            }

            return response(res, url, language.SUCCESS, statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }
}

module.exports = new FileController();
