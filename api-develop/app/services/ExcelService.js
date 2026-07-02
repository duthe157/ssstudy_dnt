const Excel = require('exceljs');
const BaseHelper = require('../helpers/BaseHelper');

class ExcelService {
    async exportData(name, data) {
        try {
            const workbook = new Excel.Workbook();
            const worksheet = workbook.addWorksheet('Data', { properties: { tabColor: { argb: 'FFC0000' } } });
            if (data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    worksheet.addRow(data[i]);
                }
            }
            const alias = BaseHelper.seoURL(name);
            const filename = 'data-' + alias + '.xlsx';
            await this.createExcelFile(filename, workbook);
            return filename;
        } catch (err) {
            console.log(err);
            logError(err);
        }
    }

    async createExcelFile(filename, workbook) {
        const pathTemp = './temp/excel/' + filename;
        return new Promise((resolve, reject) => {
            try {
                workbook.xlsx.writeFile(pathTemp).then(() => {
                    try {
                        resolve(pathTemp);
                    } catch (err) {
                        reject(err);
                    }
                });
            } catch (err) {
                reject(err);
                logError(err);
            }
        });
    }
}

module.exports = new ExcelService();