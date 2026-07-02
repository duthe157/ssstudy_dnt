
const mongoose = require('mongoose');
const ActionLogModel = require('../models/ActionLog');
const BaseHelper = require('../helpers/BaseHelper');
const language = BaseHelper.fileToJSON(`${__dirname}/../languages/vi.json`);
const ExcelJS = require('exceljs');
const moment = require('moment-timezone');

class ActionLogController {
    async list(req, res, params) {
        try {
            const page = parseInt(params.page) || 1;
            const limit = parseInt(params.limit) || 20;
            const skip = (page - 1) * limit;

            // Build query conditions
            const conditions = {};

            // Filter by user_id
            if (params.user_id) {
                conditions.user_id = params.user_id;
            }

            // Filter by user_group
            if (params.user_group) {
                conditions['user_info.user_group'] = params.user_group;
            }

            // Filter by date range
            if (params.from_date || params.to_date) {
                conditions.action_time = {};
                if (params.from_date) {
                    conditions.action_time.$gte = new Date(params.from_date);
                }
                if (params.to_date) {
                    const toDate = new Date(params.to_date);
                    toDate.setHours(23, 59, 59, 999);
                    conditions.action_time.$lte = toDate;
                }
            }

            // Filter by URL pattern
            if (params.url) {
                conditions.url = { $regex: params.url, $options: 'i' };
            }

            // Filter by method
            if (params.method) {
                conditions.method = params.method.toUpperCase();
            }

            // Filter by response status
            if (params.status) {
                conditions.response_status = parseInt(params.status);
            }

            // Get total count
            const total = await ActionLogModel.countDocuments(conditions);

            // Get logs with pagination
            const logs = await ActionLogModel.find(conditions)
                .sort({ action_time: -1 })
                .skip(skip)
                .limit(limit)
                .lean();

            return response(res, {
                records: logs,
                totalRecord: total,
                perPage: limit,
                currentPage: page,
            }, language.PROCESS_SUCCESS, statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async detail(req, res, params) {
        try {
            const id = params.id;
            if (!id) {
                return response(res, null, 'ID là bắt buộc', statusCode.ERROR);
            }

            const log = await ActionLogModel.findById(id).lean();
            if (!log) {
                return response(res, null, 'Không tìm thấy log', statusCode.ERROR);
            }

            return response(res, log, language.PROCESS_SUCCESS, statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async export(req, res, params) {
        try {
            // Build query conditions (same as list)
            const conditions = {};

            if (params.user_id) {
                conditions.user_id = params.user_id;
            }

            if (params.user_group) {
                conditions['user_info.user_group'] = params.user_group;
            }

            if (params.from_date || params.to_date) {
                conditions.action_time = {};
                if (params.from_date) {
                    conditions.action_time.$gte = new Date(params.from_date);
                }
                if (params.to_date) {
                    const toDate = new Date(params.to_date);
                    toDate.setHours(23, 59, 59, 999);
                    conditions.action_time.$lte = toDate;
                }
            }

            if (params.url) {
                conditions.url = { $regex: params.url, $options: 'i' };
            }

            if (params.method) {
                conditions.method = params.method.toUpperCase();
            }

            // Get logs (limit to 10000 for export)
            const logs = await ActionLogModel.find(conditions)
                .sort({ action_time: -1 })
                .limit(10000)
                .lean();

            // Create Excel workbook
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Action Logs');

            // Define columns
            worksheet.columns = [
                { header: 'Thời gian', key: 'action_time', width: 20 },
                { header: 'User ID', key: 'user_id', width: 15 },
                { header: 'Họ tên', key: 'fullname', width: 25 },
                { header: 'Email', key: 'email', width: 30 },
                { header: 'Nhóm', key: 'user_group', width: 15 },
                { header: 'URL', key: 'url', width: 40 },
                { header: 'Method', key: 'method', width: 10 },
                { header: 'Status', key: 'status', width: 10 },
                { header: 'IP Address', key: 'ip', width: 20 },
            ];

            // Add rows
            logs.forEach(log => {
                worksheet.addRow({
                    action_time: moment(log.action_time).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm:ss'),
                    user_id: log.user_id,
                    fullname: log.user_info?.fullname || '',
                    email: log.user_info?.email || '',
                    user_group: log.user_info?.user_group || '',
                    url: log.url,
                    method: log.method,
                    status: log.response_status,
                    ip: log.ip_address,
                });
            });

            // Style header row
            worksheet.getRow(1).font = { bold: true };
            worksheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFD3D3D3' }
            };

            // Generate buffer
            const buffer = await workbook.xlsx.writeBuffer();

            // Set response headers
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=action-logs-${Date.now()}.xlsx`);
            res.setHeader('Content-Length', buffer.length);

            return res.send(buffer);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async stats(req, res, params) {
        try {
            const fromDate = params.from_date ? new Date(params.from_date) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const toDate = params.to_date ? new Date(params.to_date) : new Date();
            toDate.setHours(23, 59, 59, 999);

            const conditions = {
                action_time: { $gte: fromDate, $lte: toDate }
            };

            // Stats by user group
            const byUserGroup = await ActionLogModel.aggregate([
                { $match: conditions },
                { $group: { _id: '$user_info.user_group', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]);

            // Stats by method
            const byMethod = await ActionLogModel.aggregate([
                { $match: conditions },
                { $group: { _id: '$method', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]);

            // Top users by activity
            const topUsers = await ActionLogModel.aggregate([
                { $match: conditions },
                {
                    $group: {
                        _id: '$user_id',
                        count: { $sum: 1 },
                        user_info: { $first: '$user_info' }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]);

            // Total actions
            const totalActions = await ActionLogModel.countDocuments(conditions);

            return response(res, {
                total_actions: totalActions,
                by_user_group: byUserGroup,
                by_method: byMethod,
                top_users: topUsers,
                date_range: { from: fromDate, to: toDate }
            }, language.PROCESS_SUCCESS, statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }
}

module.exports = new ActionLogController();
