const mongoose = require("mongoose");
const BaseModel = require("./BaseModel");

const { Schema } = mongoose;

class CeoPage extends BaseModel {
  constructor() {
    const _name = "ceo_page";
    const attributes = {
      page_id: String,
      name: String,
      avatar: String,
      ceo_description: String,
      achievements: Object,
      description: String,
    };
    const options = {
      collection: "ceo_pages",
      timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at",
      },
      versionKey: false,
    };
    const schema = Schema(attributes, options);
    super(_name, attributes, options, schema);
  }
}

module.exports = new CeoPage();
