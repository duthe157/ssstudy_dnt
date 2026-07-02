
const BaseModel = require('./BaseModel');

class Token extends BaseModel {
  constructor() {
    const _name = 'token';
    const attributes = {
      token: String,
      expired: Number,
      admin_id: String,
      user_id: String,
    };
    const options = {
      collection: 'tokens',
      timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
      },
      versionKey: false
    };

    super(_name, attributes, options);
  }
}

module.exports = new Token();
