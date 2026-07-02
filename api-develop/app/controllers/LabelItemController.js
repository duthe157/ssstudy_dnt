const appConfig = require('../../config/app');
const BaseHelper = require('../helpers/BaseHelper');
const LabelModel = require('../models/Label');
const LabelItemModel = require('../models/LabelItem');
const ClassroomModel = require('../models/Classroom');
const BookModel = require('../models/Book');
const BookIdModel = require('../models/BookId');
const language = BaseHelper.fileToJSON(`${__dirname}/../languages/vi.json`);

const ITEM_TYPE = { BOOK: 'BOOK', BOOK_ID: 'BOOK_ID', CLASSROOM: 'CLASSROOM' };
const LABEL_STATUS = { ACTIVE: 'ACTIVE', HIDDEN: 'HIDDEN' };

function getModelByType(itemType) {
    if (itemType === ITEM_TYPE.CLASSROOM) return ClassroomModel;
    if (itemType === ITEM_TYPE.BOOK) return BookModel;
    if (itemType === ITEM_TYPE.BOOK_ID) return BookIdModel;
    return null;
}

// Cập nhật lại num_item trên Label dựa trên số bản ghi thực tế trong label_items
async function syncNumItem(labelId) {
    const count = await LabelItemModel.count({ label_id: labelId });
    await LabelModel.updateOne({ _id: labelId }, { $set: { num_item: count } });
}

// Kiểm tra nhãn có thuộc nhãn cha primary không
async function isUnderPrimaryParent(label) {
    if (!label.parent_id) return label.is_primary === true;
    const parent = await LabelModel.findOne({ _id: label.parent_id, is_primary: true, deleted_at: null });
    return !!parent;
}

class LabelItemController {
    /**
     * Lấy danh sách sản phẩm (tất cả) kèm trạng thái đã gán/chưa gán cho 1 nhãn.
     * Dùng cho màn hình "Gán nhanh" từ phía nhãn.
     */
    async items(req, res, params) {
        try {
            const { label_id, item_type, teacher_id, level, subject_id } = params;
            const keyword = params.keyword || null;
            const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
            const paramLimit = parseInt(params.limit);
            const limit = paramLimit === -1 ? 0 : (paramLimit > 0 ? paramLimit : appConfig.PAGINATION.LIMIT);

            if (!label_id) return response(res, null, 'Thiếu label_id', statusCode.ERROR);
            if (!item_type || !Object.values(ITEM_TYPE).includes(item_type))
                return response(res, null, 'item_type không hợp lệ. Giá trị hợp lệ: BOOK, BOOK_ID, CLASSROOM', statusCode.ERROR);

            const label = await LabelModel.findOne({ _id: label_id, deleted_at: null });
            if (!label) return response(res, null, 'Nhãn không tồn tại', statusCode.ERROR);

            const productModel = getModelByType(item_type);
            const conditions = { deleted_at: null };

            if(teacher_id) conditions.teacher_id = teacher_id;
            if(level && level.length) conditions.level = { $in: level };
            if(subject_id) conditions['subject.id'] = subject_id;

            if (keyword) {
                conditions.name = { $regex: keyword.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), $options: 'i' };
            }

            const options = { sort: { created_at: -1 } };
            if (limit > 0) {
                options.skip = (page - 1) * limit;
                options.limit = limit;
            }

            const [products, total] = await Promise.all([
                productModel.find(conditions, { name: 1, image: 1, subject: 1, status: 1, alias: 1, level: 1, group: 1, teacher:1, teacher_id: 1 }, options),
                productModel.count(conditions)
            ]);

            // Lấy tất cả item đã gán của nhãn này theo item_type
            const productIds = products.map(p => p._id.toString());
            const assignedItems = await LabelItemModel.find({
                label_id,
                item_id: { $in: productIds },
                item_type
            });
            const assignedSet = new Set(assignedItems.map(a => a.item_id));

            const records = products.map(p => ({
                ...p._doc,
                item_type,
                is_assigned: assignedSet.has(p._id.toString())
            }));

            return response(res, { records, totalRecord: total, perPage: limit, currentPage: page }, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    /**
     * Gán 1 sản phẩm vào nhãn (từ phía nhãn hoặc phía sản phẩm).
     */
    async addItem(req, res, params) {
        try {
            const { label_id, item_id, item_type } = params;

            if (!label_id || !item_id || !item_type)
                return response(res, null, 'Thiếu label_id, item_id hoặc item_type', statusCode.ERROR);
            if (!Object.values(ITEM_TYPE).includes(item_type))
                return response(res, null, 'item_type không hợp lệ. Giá trị hợp lệ: BOOK, BOOK_ID, CLASSROOM', statusCode.ERROR);

            // Nhãn phải tồn tại và đang ACTIVE
            const label = await LabelModel.findOne({ _id: label_id, deleted_at: null });
            if (!label) return response(res, null, 'Nhãn không tồn tại', statusCode.ERROR);
            if (label.status === LABEL_STATUS.HIDDEN)
                return response(res, null, 'Không thể gán vào nhãn đang ẩn', statusCode.ERROR);
            if (!await isUnderPrimaryParent(label))
                return response(res, null, 'Nhãn không thuộc nhãn cha đang được sử dụng', statusCode.ERROR);

            // Sản phẩm phải tồn tại
            const productModel = getModelByType(item_type);
            const product = await productModel.findOne({ _id: item_id, deleted_at: null });
            if (!product) return response(res, null, 'Sản phẩm không tồn tại', statusCode.ERROR);

            // Kiểm tra đã gán chưa
            const existed = await LabelItemModel.findOne({ label_id, item_id, item_type });
            if (existed) return response(res, existed, 'Sản phẩm đã được gán vào nhãn này', statusCode.OK);

            const labelItem = await LabelItemModel.create({ label_id, item_id, item_type });

            // Cập nhật num_item
            await syncNumItem(label_id);

            return response(res, labelItem, 'Gán nhãn thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    /**
     * Bỏ gán 1 sản phẩm khỏi nhãn.
     */
    async removeItem(req, res, params) {
        try {
            const { label_id, item_id, item_type } = params;

            if (!label_id || !item_id || !item_type)
                return response(res, null, 'Thiếu label_id, item_id hoặc item_type', statusCode.ERROR);
            if (!Object.values(ITEM_TYPE).includes(item_type))
                return response(res, null, 'item_type không hợp lệ. Giá trị hợp lệ: BOOK, BOOK_ID, CLASSROOM', statusCode.ERROR);

            const label = await LabelModel.findOne({ _id: label_id, deleted_at: null });
            if (!label) return response(res, null, 'Nhãn không tồn tại', statusCode.ERROR);

            await LabelItemModel.delete({ label_id, item_id, item_type });

            // Cập nhật num_item
            await syncNumItem(label_id);

            return response(res, {}, 'Bỏ gán nhãn thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    /**
     * Lấy danh sách nhãn để gán cho 1 sản phẩm (từ phía sản phẩm).
     */
    async labelsByItem(req, res, params) {
        try {
            const { item_id, item_type } = params;

            if (!item_id || !item_type)
                return response(res, null, 'Thiếu item_id hoặc item_type', statusCode.ERROR);
            if (!Object.values(ITEM_TYPE).includes(item_type))
                return response(res, null, 'item_type không hợp lệ. Giá trị hợp lệ: BOOK, BOOK_ID, CLASSROOM', statusCode.ERROR);

            const sortOpt = { sort: { ordering: 1, created_at: -1 } };

            // Chỉ lấy nhãn cha primary và con của nhãn đó
            const primaryParent = await LabelModel.findOne({ parent_id: null, is_primary: true, deleted_at: null, status: 'ACTIVE' });
            if (!primaryParent) return response(res, { records: [] }, 'Thành công', statusCode.OK);

            const [allChildren, labelItems] = await Promise.all([
                LabelModel.find({ parent_id: primaryParent._id.toString(), deleted_at: null, status: 'ACTIVE' }, null, sortOpt),
                LabelItemModel.find({ item_id, item_type })
            ]);
            const rootLabels = [primaryParent];

            const assignedSet = new Set(labelItems.map(li => li.label_id));

            // Group children theo parent_id, gắn is_assigned vào từng con
            const childrenMap = allChildren.reduce((map, child) => {
                const pid = child.parent_id;
                if (!map[pid]) map[pid] = [];
                map[pid].push({ ...child._doc, is_assigned: assignedSet.has(child._id.toString()) });
                return map;
            }, {});

            // Build tree: gắn children + is_assigned vào từng nhãn cha
            const records = rootLabels.map(label => ({
                ...label._doc,
                is_assigned: assignedSet.has(label._id.toString()),
                children: childrenMap[label._id.toString()] || null
            }));

            return response(res, { records }, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    /**
     * Gán/huỷ nhãn cho nhiều sản phẩm trong 1 request (bulk từ phía nhãn).
     */
    async bulkUpdateItems(req, res, params) {
        try {
            const { label_id, items } = params;

            if (!label_id) return response(res, null, 'Thiếu label_id', statusCode.ERROR);
            if (!Array.isArray(items) || items.length === 0)
                return response(res, null, 'Danh sách items không hợp lệ hoặc rỗng', statusCode.ERROR);

            // Validate từng item trước khi xử lý
            for (const item of items) {
                if (!item.item_id || !item.item_type || !item.action)
                    return response(res, null, 'Mỗi item phải có item_id, item_type và action', statusCode.ERROR);
                if (!Object.values(ITEM_TYPE).includes(item.item_type))
                    return response(res, null, `item_type không hợp lệ: ${item.item_type}. Giá trị hợp lệ: BOOK, BOOK_ID, CLASSROOM`, statusCode.ERROR);
                if (!['ADD', 'REMOVE'].includes(item.action))
                    return response(res, null, `action không hợp lệ: ${item.action}. Giá trị hợp lệ: ADD, REMOVE`, statusCode.ERROR);
            }

            const label = await LabelModel.findOne({ _id: label_id, deleted_at: null });
            if (!label) return response(res, null, 'Nhãn không tồn tại', statusCode.ERROR);
            if (label.status !== LABEL_STATUS.ACTIVE)
                return response(res, null, 'Không thể gán vào nhãn đang ẩn hoặc đã xóa', statusCode.ERROR);
            if (!await isUnderPrimaryParent(label))
                return response(res, null, 'Nhãn không thuộc nhãn cha đang được sử dụng', statusCode.ERROR);

            const toAdd = items.filter(i => i.action === 'ADD');
            const toRemove = items.filter(i => i.action === 'REMOVE');

            // ADD: loại bỏ những bản ghi đã tồn tại trước khi insert
            if (toAdd.length > 0) {
                const existing = await LabelItemModel.find({
                    label_id,
                    item_id: { $in: toAdd.map(i => i.item_id) }
                });
                const existingKeys = new Set(existing.map(e => `${e.item_id}:${e.item_type}`));
                const newDocs = toAdd
                    .filter(i => !existingKeys.has(`${i.item_id}:${i.item_type}`))
                    .map(i => ({ label_id, item_id: i.item_id, item_type: i.item_type }));
                // Tạo từng document song song — tránh Mongoose gọi save() tuần tự
                // khiến document sau bị bỏ qua khi document trước gặp lỗi
                if (newDocs.length > 0) {
                    await Promise.all(newDocs.map(doc => LabelItemModel.create(doc)));
                }
            }

            // REMOVE: xoá từng bản ghi khớp label_id + item_id + item_type
            if (toRemove.length > 0) {
                await LabelItemModel.delete(
                    { $or: toRemove.map(i => ({ label_id, item_id: i.item_id, item_type: i.item_type })) },
                    true
                );
            }

            await syncNumItem(label_id);

            return response(res, {}, 'Cập nhật nhãn thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    /**
     * Gán nhiều nhãn cùng lúc cho 1 sản phẩm (bulk assign từ phía sản phẩm).
     * Truyền label_ids (array) — sẽ thay thế toàn bộ nhãn hiện tại của sản phẩm.
     */
    async syncLabels(req, res, params) {
        try {
            const { item_id, item_type, label_ids } = params;

            if (!item_id || !item_type)
                return response(res, null, 'Thiếu item_id hoặc item_type', statusCode.ERROR);
            if (!Object.values(ITEM_TYPE).includes(item_type))
                return response(res, null, 'item_type không hợp lệ. Giá trị hợp lệ: BOOK, BOOK_ID, CLASSROOM', statusCode.ERROR);

            const newLabelIds = Array.isArray(label_ids) ? label_ids : [];

            // Validate tất cả nhãn phải ACTIVE, tồn tại và thuộc nhãn cha primary
            if (newLabelIds.length > 0) {
                const validLabels = await LabelModel.find({
                    _id: { $in: newLabelIds },
                    deleted_at: null,
                    status: LABEL_STATUS.ACTIVE
                });
                if (validLabels.length !== newLabelIds.length)
                    return response(res, null, 'Một hoặc nhiều nhãn không hợp lệ hoặc đang ẩn', statusCode.ERROR);

                const primaryChecks = await Promise.all(validLabels.map(l => isUnderPrimaryParent(l)));
                if (primaryChecks.some(ok => !ok))
                    return response(res, null, 'Một hoặc nhiều nhãn không thuộc nhãn cha đang được sử dụng', statusCode.ERROR);
            }

            // Xóa toàn bộ gán cũ, tạo lại
            await LabelItemModel.delete({ item_id, item_type }, true);

            if (newLabelIds.length > 0) {
                const docs = newLabelIds.map(lid => ({ label_id: lid, item_id, item_type }));
                await LabelItemModel.create(docs);
            }

            // Cập nhật num_item cho tất cả nhãn liên quan
            const affectedLabelIds = [...new Set([...newLabelIds])];
            await Promise.all(affectedLabelIds.map(lid => syncNumItem(lid)));

            return response(res, {}, 'Cập nhật nhãn thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }


}

module.exports = new LabelItemController();
