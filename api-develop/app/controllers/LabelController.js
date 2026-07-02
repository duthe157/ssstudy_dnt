const appConfig = require('../../config/app');
const BaseHelper = require('../helpers/BaseHelper');
const LabelModel = require('../models/Label');
const LabelItemModel = require('../models/LabelItem');
const language = BaseHelper.fileToJSON(`${__dirname}/../languages/vi.json`);

const LABEL_STATUS = { ACTIVE: 'ACTIVE', HIDDEN: 'HIDDEN', DELETED: 'DELETED' };

class LabelController {
    async list(req, res, params) {
        try {
            const keyword = params.keyword || null;
            // Normalize input sang uppercase, mặc định ACTIVE
            const rawStatus = (params.status || 'active').toString().toUpperCase();
            const status = Object.values(LABEL_STATUS).includes(rawStatus) ? rawStatus : LABEL_STATUS.ACTIVE;

            const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
            const paramLimit = parseInt(params.limit);
            const limit = paramLimit === -1 ? 0 : (paramLimit > 0 ? paramLimit : appConfig.PAGINATION.LIMIT);

            const isDeletedView = status === LABEL_STATUS.DELETED;
            // DELETED labels có deleted_at != null; ACTIVE/HIDDEN labels có deleted_at = null
            const childDeletedAt = isDeletedView ? { $ne: null } : null;

            const rootConditions = { parent_id: null };

            if (!isDeletedView) {
                // ACTIVE / HIDDEN: chỉ lấy nhãn chưa bị xóa mềm
                rootConditions.deleted_at = null;
            }
            // DELETED: không giới hạn deleted_at trên root vì nhãn DELETED có deleted_at != null

            if (status === LABEL_STATUS.ACTIVE) {
                // ACTIVE view: chỉ lấy nhãn cha ACTIVE, không cần lookup con
                rootConditions.status = LABEL_STATUS.ACTIVE;
            } else {
                // HIDDEN / DELETED: nhãn cha có status đó HOẶC nhãn cha ACTIVE có con mang status đó
                const childrenWithStatus = await LabelModel.find(
                    { status, deleted_at: childDeletedAt, parent_id: { $ne: null } },
                    { parent_id: 1 }
                );
                const parentIdsFromStatusChildren = [...new Set(childrenWithStatus.map(c => c.parent_id))];
                rootConditions.$or = [
                    { status },
                    { _id: { $in: parentIdsFromStatusChildren } }
                ];
            }

            // Keyword: nhãn cha khớp HOẶC nhãn cha có con (cùng status) khớp keyword
            if (keyword) {
                const keywordRegex = {
                    $regex: keyword.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'),
                    $options: 'i'
                };
                const matchedChildren = await LabelModel.find(
                    { status, deleted_at: childDeletedAt, parent_id: { $ne: null }, name: keywordRegex },
                    { parent_id: 1 }
                );
                const parentIdsFromChildren = matchedChildren.map(c => c.parent_id);
                const keywordOr = [
                    { name: keywordRegex },
                    { _id: { $in: parentIdsFromChildren } }
                ];

                if (rootConditions.$or) {
                    // Kết hợp status $or và keyword $or bằng $and
                    rootConditions.$and = [
                        { $or: rootConditions.$or },
                        { $or: keywordOr }
                    ];
                    delete rootConditions.$or;
                } else {
                    rootConditions.$or = keywordOr;
                }
            }

            const options = { sort: { ordering: 1, created_at: -1 } };
            if (limit > 0) {
                options.skip = (page - 1) * limit;
                options.limit = limit;
            }

            const sortKey = params.sort_key || null;
            const sortValue = params.sort_value || null;
            if (sortKey && (sortValue == 1 || sortValue == -1)) {
                options.sort = { [sortKey]: parseInt(sortValue) };
            }

            const [rootLabels, total] = await Promise.all([
                LabelModel.find(rootConditions, null, options),
                LabelModel.count(rootConditions)
            ]);

            let records = rootLabels.map(l => ({ ...l._doc, children: null }));

            if (rootLabels.length > 0) {
                const rootIds = rootLabels.map(r => r._id.toString());

                // Chỉ attach con có cùng status với view hiện tại
                const childrenList = await LabelModel.find(
                    { status, deleted_at: childDeletedAt, parent_id: { $in: rootIds }, },
                    null,
                    { sort: { ordering: 1, created_at: -1 } }
                );

                const childrenMap = childrenList.reduce((map, child) => {
                    const pid = child.parent_id;
                    if (!map[pid]) map[pid] = [];
                    map[pid].push(child);
                    return map;
                }, {});

                records = rootLabels.map(label => ({
                    ...label._doc,
                    children: childrenMap[label._id.toString()] || null
                }));
            }

            return response(res, { records, totalRecord: total, perPage: limit, currentPage: page }, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async count(req, res, params) {
        try {
            const [active, hidden, deleted] = await Promise.all([
                LabelModel.count({ parent_id: { $ne: null }, status: LABEL_STATUS.ACTIVE, deleted_at: null }),
                LabelModel.count({ parent_id: { $ne: null }, status: LABEL_STATUS.HIDDEN, deleted_at: null }),
                LabelModel.count({ parent_id: { $ne: null }, status: LABEL_STATUS.DELETED, deleted_at: { $ne: null } })
            ]);

            return response(res, { active, hidden, deleted }, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async listPublic(req, res, params) {
        try {
            const sortOpt = { sort: { ordering: 1, created_at: -1 } };

            const primaryParent = await LabelModel.findOne({ parent_id: null, is_primary: true, deleted_at: null, status: LABEL_STATUS.ACTIVE });
            if (!primaryParent) return response(res, { record: null }, 'Thành công', statusCode.OK);

            const children = await LabelModel.find(
                { parent_id: primaryParent._id.toString(), deleted_at: null, status: LABEL_STATUS.ACTIVE },
                null,
                sortOpt
            );

            const record = { ...primaryParent._doc, children };

            return response(res, { record }, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async updateChildrenOrdering(req, res, params) {
        try {
            const { parent_id, children } = params;

            if (!parent_id) return response(res, null, 'Thiếu parent_id', statusCode.ERROR);
            if (!Array.isArray(children) || children.length === 0)
                return response(res, null, 'Danh sách children không hợp lệ hoặc rỗng', statusCode.ERROR);

            for (const item of children) {
                if (!item.id || item.ordering === undefined)
                    return response(res, null, 'Mỗi phần tử phải có id và ordering', statusCode.ERROR);
            }

            const parent = await LabelModel.findOne({ _id: parent_id, parent_id: null, deleted_at: null });
            if (!parent) return response(res, null, 'Nhãn cha không tồn tại', statusCode.ERROR);

            await Promise.all(
                children.map(item =>
                    LabelModel.updateOne(
                        { _id: item.id, parent_id: parent_id },
                        { $set: { ordering: parseInt(item.ordering) } }
                    )
                )
            );

            return response(res, {}, 'Cập nhật thứ tự thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async setPrimary(req, res, params) {
        try {
            const { id } = params;
            if (!id) return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);

            const label = await LabelModel.findOne({ _id: id, deleted_at: null });
            if (!label) return response(res, null, 'Nhãn không tồn tại', statusCode.ERROR);
            if (label.parent_id) return response(res, null, 'Chỉ nhãn cha mới có thể đặt làm primary', statusCode.ERROR);
            if (label.status !== LABEL_STATUS.ACTIVE) return response(res, null, 'Nhãn phải đang ACTIVE mới có thể đặt làm primary', statusCode.ERROR);

            // Bỏ primary của tất cả nhãn cha khác, set primary cho nhãn này
            await Promise.all([
                LabelModel.updateMany({ parent_id: null, _id: { $ne: id } }, { $set: { is_primary: false } }),
                LabelModel.updateOne({ _id: id }, { $set: { is_primary: true } })
            ]);

            return response(res, {}, 'Đặt nhãn primary thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async detail(req, res, params) {
        try {
            const { id } = params;
            if (!id) return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);

            const label = await LabelModel.findOne({ _id: id, deleted_at: null });
            if (!label) return response(res, null, 'Nhãn không tồn tại', statusCode.ERROR);

            // Lấy danh sách nhãn con nếu là nhãn cha
            const children = await LabelModel.find({ parent_id: id, deleted_at: null }, null, { sort: { ordering: 1 } });
            label._doc.children = children;

            return response(res, label, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async create(req, res, params) {
        try {
            const { name, parent_id } = params;
            const ordering = parseInt(params.ordering) || 0;

            if (!name) return response(res, null, language.CANNOT_EMPTY.replace('%s', language.NAME), statusCode.ERROR);

            // Validate nhãn cha tồn tại nếu có truyền vào
            if (parent_id) {
                const parent = await LabelModel.findOne({ _id: parent_id, deleted_at: null });
                if (!parent) return response(res, null, 'Nhãn cha không tồn tại', statusCode.ERROR);

                // Chỉ cho phép 2 cấp: nhãn cha không được là nhãn con
                if (parent.parent_id) return response(res, null, 'Không thể tạo nhãn cấp 3. Hệ thống chỉ hỗ trợ 2 cấp nhãn', statusCode.ERROR);
            }

            const alias = BaseHelper.seoURL(name);
            const doc = {
                name,
                alias,
                parent_id: parent_id || null,
                status: LABEL_STATUS.ACTIVE,
                ordering,
                num_item: 0
            };

            const label = await LabelModel.create(doc);
            if (!label) return response(res, null, language.ERROR, statusCode.ERROR);

            return response(res, label, 'Tạo nhãn thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async update(req, res, params) {
        try {
            const { id, name, parent_id } = params;
            const ordering = params.ordering !== undefined ? parseInt(params.ordering) : undefined;

            if (!id) return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);

            const label = await LabelModel.findOne({ _id: id, deleted_at: null });
            if (!label) return response(res, null, 'Nhãn không tồn tại', statusCode.ERROR);

            if (name) {
                label.name = name;
                label.alias = BaseHelper.seoURL(name);
            }

            if (parent_id !== undefined) {
                if (parent_id) {
                    // Không cho phép tự gán làm con của chính mình
                    if (parent_id === id) return response(res, null, 'Nhãn không thể là cha của chính nó', statusCode.ERROR);

                    const parent = await LabelModel.findOne({ _id: parent_id, deleted_at: null });
                    if (!parent) return response(res, null, 'Nhãn cha không tồn tại', statusCode.ERROR);
                    if (parent.parent_id) return response(res, null, 'Không thể tạo nhãn cấp 3. Hệ thống chỉ hỗ trợ 2 cấp nhãn', statusCode.ERROR);
                }
                label.parent_id = parent_id || null;
            }

            if (ordering !== undefined) label.ordering = ordering;

            const rs = await LabelModel.updateOne({ _id: id }, { $set: { name: label.name, alias: label.alias, parent_id: label.parent_id, ordering: label.ordering } });

            return response(res, label, 'Cập nhật nhãn thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async updateStatus(req, res, params) {
        try {
            const { id, status } = params;
            if (!id) return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);
            if (!status || !Object.values(LABEL_STATUS).includes(status))
                return response(res, null, 'Trạng thái không hợp lệ. Giá trị hợp lệ: ACTIVE, HIDDEN, DELETED', statusCode.ERROR);

            // Không lọc deleted_at để cho phép restore nhãn đã bị xóa mềm qua status=ACTIVE
            const label = await LabelModel.findOne({ _id: id });
            if (!label) return response(res, null, 'Nhãn không tồn tại', statusCode.ERROR);

            // status=DELETED: xóa mềm (set deleted_at). ACTIVE/HIDDEN: xóa mềm nếu có.
            const updateData = status === LABEL_STATUS.DELETED
                ? { status: LABEL_STATUS.DELETED, deleted_at: new Date() }
                : { status, deleted_at: null };

            await LabelModel.updateOne({ _id: id }, { $set: updateData });
            label.status = updateData.status;
            label.deleted_at = updateData.deleted_at;

            // Nếu là nhãn cha, áp dụng cùng updateData cho tất cả nhãn con
            if (!label.parent_id) {
                await LabelModel.updateMany(
                    { parent_id: id.toString() },
                    { $set: updateData }
                );
            }

            return response(res, label, 'Cập nhật trạng thái thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async restore(req, res, params) {
        try {
            const ids = params.ids || [];
            const id = params.id || null;
            if (id) ids.push(id);
            if (ids.length === 0) return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);

            // Lấy thêm id các nhãn con của những nhãn cha trong danh sách
            const childLabels = await LabelModel.find({ parent_id: { $in: ids } }, { _id: 1 });
            const childIds = childLabels.map(c => c._id.toString());
            const allIds = [...new Set([...ids, ...childIds])];

            await LabelModel.updateMany(
                { _id: { $in: allIds } },
                { $set: { deleted_at: null, status: LABEL_STATUS.ACTIVE } }
            );

            return response(res, {}, 'Khôi phục nhãn thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async permanentDelete(req, res, params) {
        try {
            const ids = params.ids || [];
            const id = params.id || null;
            if (id) ids.push(id);
            if (ids.length === 0) return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);

            // Lấy cả nhãn con để xóa cùng
            const childLabels = await LabelModel.find({ parent_id: { $in: ids } });
            const childIds = childLabels.map(c => c._id.toString());
            const allIds = [...ids, ...childIds];

            // Xóa vĩnh viễn nhãn và toàn bộ quan hệ gán trong label_items
            await Promise.all([
                LabelModel.delete({ _id: { $in: allIds } }, true),
                LabelItemModel.delete({ label_id: { $in: allIds } }, true)
            ]);

            return response(res, {}, 'Xóa vĩnh viễn nhãn thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }
}

module.exports = new LabelController();
