const CeoPage = require("../models/CeoPage");
const BaseHelper = require("../helpers/BaseHelper");
const UploadService = require("../services/UploadService");

const language = BaseHelper.fileToJSON(`${__dirname}/../languages/vi.json`);

class CeoPageController {
  async create(req, res, params) {
    try {
      const page_id = params.page_id || 1;
      const name = params.name || "CEO Name";
      const avatar = params.avatar || "";
      const ceo_description = params.ceo_description || "CEO Description";
      const achievements = params.achievements || {};
      const description = params.description || "Description";
      if (avatar && avatar.length > 0) {
        const fileData = await UploadService.upload(
          avatar[0],
          "base64",
          "ceopage"
        );
        if (fileData) {
          _doc.image = appConfig.FILE_DOMAIN + "/" + fileData[0];
        }
      }
      const data = await CeoPage.create({
        page_id,
        name,
        avatar,
        ceo_description,
        achievements,
        description,
      });
      return response(res, data, language.SUCCESS, statusCode.OK);
    } catch (err) {
      console.error(err);
      return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
    }
  }
  async detail(req, res, params) {
    try {
      const page_id = params.page_id || 1;
      const data = await CeoPage.findOne({ page_id });
      if (!data) {
        return response(
          res,
          {},
          "Trang CEO chưa được khai báo !",
          statusCode.ERROR
        );
      }
      return response(res, data, language.SUCCESS, statusCode.OK);
    } catch (err) {
      console.error(err);
      return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
    }
  }

  async update(req, res, params) {
    try {
      const {
        page_id = 1,
        name,
        avatar,
        ceo_description,
        achievements,
        description,
      } = params;
      const existingPage = await CeoPage.findOne({ page_id });
      if (!existingPage) {
        console.log("CeoPage not found, creating a new one.");
        return this.create(req, res, params);
      }

      if (avatar && avatar.length > 0) {
        const fileData = await UploadService.upload(
          avatar[0],
          "base64",
          "ceo-page"
        );
        if (fileData) {
          avatar = appConfig.FILE_DOMAIN + "/" + fileData[0];
        }
      }
      const data = await CeoPage.updateOne(
        { page_id },
        {
          name,
          avatar,
          ceo_description,
          achievements,
          description,
        }
      );
      if (!data) {
        return response(res, {}, language.NOT_FOUND, statusCode.NOT_FOUND);
      }
      return response(res, data, language.SUCCESS, statusCode.OK);
    } catch (err) {
      console.error(err);
      return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
    }
  }
  //   async delete(req, res) {
  //     try {
  //       const { id } = req.params;
  //       await CeoPage.findByIdAndDelete(id);

  //       return response(res, {}, language.SUCCESS, statusCode.OK);
  //     } catch (err) {
  //       console.error(err);
  //       return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
  //     }
  //   }
}

module.exports = new CeoPageController();
