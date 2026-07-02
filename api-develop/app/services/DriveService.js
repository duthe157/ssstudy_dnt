const axios = require('axios');
const { PDFDocument } = require('pdf-lib');

class DriveService {
    // Function to extract the file ID from Google Drive URL
    async extractFileId(googleDriveUrl) {
        const regex = /\/d\/(.*?)\/view/;
        const match = googleDriveUrl.match(regex);
        return match ? match[1] : null;
    }

    // Function to fetch a PDF as a Uint8Array
    async fetchPdfFromDrive(driveUrl) {
        const regex = /\/d\/(.*?)\/view/;
        const match = driveUrl.match(regex);
        const fileId = match ? match[1] : null;
        if (!fileId) {
            throw new Error('Invalid Google Drive URL');
        }

        const downloadUrl = `https://drive.google.com/uc?id=${fileId}&export=download`;

        try {
            const response = await axios({
                method: 'GET',
                url: downloadUrl,
                responseType: 'arraybuffer', // Fetch the file as binary data
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching PDF from Google Drive: ${error.message}`);
            throw new Error('Failed to fetch PDF');
        }
    }

    async getFilePDF(pdfUrls){
        if (!Array.isArray(pdfUrls) || pdfUrls.length === 0) {
            throw new Error('No file PDF!');
        }

        // Create a new PDF document for merging
        const mergedPdf = await PDFDocument.create();
        // Download PDFs in parallel
        const pdfBuffers = await Promise.all(pdfUrls.map(this.fetchPdfFromDrive));

        // Fetch and merge each PDF
        for (const buffer of pdfBuffers.filter(Boolean)) {
            const pdfToMerge = await PDFDocument.load(buffer);

            const copiedPages = await mergedPdf.copyPages(pdfToMerge, pdfToMerge.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        }

        // Serialize the merged PDF to bytes
        return mergedPdf.save();
    }
}

module.exports = new DriveService();