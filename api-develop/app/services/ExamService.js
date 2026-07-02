const ExamPendingModel = require('../models/ExamPending');
const ExamClassroomModel = require('../models/ExamClassroom');
const AppService = require('./AppService');

class ExamService {
    async sendExam(classroom, exam, examStartedAt, examFinishedAt) {
        try {
            let startedAt = null;
            let finishedAt = null;
            let isFixedTime = false;
            if (examStartedAt)
                startedAt = new Date(examStartedAt);
            if (examFinishedAt)
            finishedAt = new Date(examFinishedAt);

            if (startedAt && finishedAt)
                isFixedTime = true;

            const docExamPending = {
                type: (exam && exam.type) ? exam.type : 'TRAC_NGHIEM',
                is_fixed_time: isFixedTime,
                exam: {
                    id: exam._id,
                    code: exam.code,
                    name: exam.name
                },
                classroom: {
                    id: classroom._id,
                    code: classroom.code,
                    name: classroom.name
                },
                subject: exam.subject,
                is_redo: exam.is_redo || false,
                started_at: startedAt,
                finished_at: finishedAt
            };
            let msg = '';
            const examPending = await ExamPendingModel.create(docExamPending);
            if (examPending)
                msg = 'Gửi đề thi thành công!';

            const conditions = {};
            conditions.exam_id = exam._id;
            conditions['classroom.id'] = classroom._id;
            const docExamClassroom = { status: 'SENT' };
            docExamClassroom.started_at = startedAt;
            docExamClassroom.finished_at = finishedAt;
            docExamClassroom.is_fixed_time = isFixedTime;
            docExamClassroom.type = exam.type;
            const rs = await ExamClassroomModel.updateOne(conditions, { $set: docExamClassroom });
            if (rs.nModified) {
                AppService.sendNotifyExam(exam, classroom);
                console.log('send Exam: ExamService');
                return;
            }
            console.log('Dont send Exam: ExamService');
        } catch (err) {
            logError(err);
            console.log(err);
            return;
        }
    }
}

module.exports = new ExamService();