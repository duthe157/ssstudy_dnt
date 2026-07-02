const config = require('../../config/config');
const appConfig = require('../../config/app');
const UploadService = require("../services/UploadService");
const SubjectModel = require("../models/Subject");
const BaseHelper = require("../helpers/BaseHelper");
const ExamCategoryModel = require("../models/ExamCategory");
const AppService = require("../services/AppService");
const ExamQuestionModel = require("../models/ExamQuestion");
const ExamSectionModel = require("../models/ExamSection");
const ExamSectionGroupModel = require("../models/ExamSectionGroup");
const QuestionV2Model = require("../models/Question_v2");
const ExamModel = require("../models/Exam");
const DriveService = require("../services/DriveService")
const ScoringService = require("../services/ScoringService")
const ScoreHistoryModel = require("../models/ScoreHistory")
const ExamClassroomModel = require("../models/ExamClassroom")
const ClassroomModel = require("../models/Classroom")
const lodash = require("lodash");
const StudentClassroomModel = require("../models/StudentClassroom");
const QuestionV2ReportModel = require("../models/QuestionV2Report");
const UserModel = require("../models/User");


const language = BaseHelper.fileToJSON(`${__dirname}/../languages/vi.json`);

const MESSAGE = 'Bạn đã hoàn tất bài thi. Hệ thống hiện không cho phép làm lại bài thi này.'

class Exam_v2Controller {

    async create(req, res, params) {
        try {
            const questions = params.questions || [];
            const startedAt = params.started_at || null;
            const finishedAt = params.finished_at || null;
            let docLink = params.doc_link || null;
            const videoLink = params.video_link || null;
            const configQuestion = params.configs || [];
            const chapters = params.chapter_ids || [];
            const tp = params.tp || null;
            const month = params.month || null;

            const type = params.type || appConfig.NEW_EXAM_TYPE.TOT_NGHIEP;
            const name = params.name || ''; // Ten de thi
            const subjectID = params.subject_id || null;//mon hoc
            let timeExam = params.time || null; //thoi gian lam bai
            const categoryID = params.category_id || null;//loai de thi
            const isRedo = params.is_redo || false; //Cho phep lam lai
            const group = params.group || 'MAC_DINH'; //nhom de
            const docType = params.doc_type || appConfig.EXAM_LINK_TYPE.GOOGLE_DRIVE;
            const examDocLink = params.exam_doc_link || null;// link de
            const level = params.level || null;//cap hoc

            const creatingType = params.creating_type || appConfig.EXAM_CREATING_TYPE.MANUAL;//thu cong hay nhom cau hoi
            const classroomId = params.classroom_id || null; //lien ket khoa hoc
            const isPayFee = params.is_pay_fee || false;//co phi hay khong
            const configPointTrueFalse = params.point_true_false || null; //cau hinh thang diem cau hoi dung sai
            const answerDocLink = params.answer_doc_link || null;

            if (!name)
                return response(res, null, language.EXAM_NAME_EMPTY, statusCode.ERROR);

            if (!subjectID)
                return response(res, null, language.CANNOT_EMPTY.replace('%s', language.SUBJECT), statusCode.ERROR);

            const subject = await SubjectModel.findOne({_id: subjectID});
            if (!subject)
                return response(res, null, language.ITEM_NOT_EXIST.replace('%s', language.SUBJECT), statusCode.ERROR);

            if (!timeExam)
                return response(res, null, 'Vui lòng nhập thời gian làm bài thi.', statusCode.ERROR);

            timeExam = parseInt(timeExam);

            const alias = await BaseHelper.seoURL(name);
            let exam = null;

            if (docLink && docLink != 'null' && docType == 'GOOGLE_DRIVE' && docLink && docLink.indexOf('google.com') < 0)
                return response(res, null, 'Link tài liệu không đúng định dạng Google Drive', statusCode.ERROR);

            if (docType === 'PDF') {
                const {files} = req;
                if (files && files[0]) {
                    const fileData = await UploadService.upload(files, 'binary', 'doc-exams');
                    if (fileData && fileData.length > 0) {
                        docLink = config.FILE_DOMAIN + '/' + fileData[0];
                    }
                }
            }

            const docExam = {
                name: name,
                alias: alias,
                type: type,
                group,
                level,
                creating_type: creatingType,
                subject: {id: subject.id, name: subject.name},
                doc_link: docLink,
                doc_type: docType,
                video_link: videoLink,
                exam_doc_link: examDocLink,
                started_at: startedAt,
                finished_at: finishedAt,
                time: timeExam,
                chapters: chapters,
                configs: configQuestion,
                questions: questions,
                is_redo: isRedo,
                classroom_id: classroomId,
                is_pay_fee: isPayFee,
                point_true_false: configPointTrueFalse,
                answer_doc_link: answerDocLink
            };

            if (categoryID) {
                const category = await ExamCategoryModel.findOne({_id: categoryID});
                if (category)
                    docExam.category = {id: category.id, name: category.name};
            }

            exam = await AppService.createExam(docExam);

            if (!exam)
                return response(res, {}, language.ERROR, statusCode.ERROR);
            if (classroomId) {
                await this.addClassroom(exam._id, classroomId);
            }

            return response(res, exam, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.ERROR, statusCode.ERROR);
        }

    }

    async update(req, res, params) {
        try {
            const id = params.id || null;
            const name = params.name || null; // Ten de thi
            const docLink = params.doc_link || null;
            const subjectID = params.subject_id || null;//mon hoc
            let timeExam = params.time || null; //thoi gian lam bai
            const categoryID = params.category_id || null;//loai de thi
            const isRedo = params.is_redo || null; //Cho phep lam lai
            const group = params.group || null; //nhom de
            const docType = params.doc_type || null;
            const examDocLink = params.exam_doc_link || null;// link de
            const level = params.level || null;//cap hoc
            const code = params.code || null;//cap hoc

            const creatingType = params.creating_type || null;//thu cong hay nhom cau hoi
            const classroomId = params.classroom_id || null; //lien ket khoa hoc
            const isPayFee = params.is_pay_fee || null;//co phi hay khong
            const configPointTrueFalse = params.point_true_false || null; //cau hinh thang diem cau hoi dung sai
            const answerDocLink = params.answer_doc_link || null;

            if (!id)
                return response(res, null, 'Request không hợp lệ!', statusCode.OK);

            const exam = await ExamModel.findOne({_id: id});

            if (!subjectID)
                return response(res, null, language.CANNOT_EMPTY.replace('%s', language.SUBJECT), statusCode.ERROR);

            if (!exam)
                return response(res, {}, language.EXAM_NOT_EXIST, statusCode.ERROR);
            if (!subjectID)
                return response(res, null, language.CANNOT_EMPTY.replace('%s', language.SUBJECT), statusCode.ERROR);

            let subject = null;
            if (subjectID)
                subject = await SubjectModel.findOne({_id: subjectID});

            if (!subject)
                return response(res, null, language.ITEM_NOT_EXIST.replace('%s', language.SUBJECT), statusCode.ERROR);

            const alias = BaseHelper.seoURL(name);
            if (name) {
                exam.name = name;
                exam.alias = alias;
            }
            if (code)
                exam.code = code;

            if (docLink && docLink !== 'null') {
                exam.doc_link = docLink;
                if (docType === 'GOOGLE_DRIVE' && docLink && docLink.indexOf('google.com') < 0)
                    return response(res, null, 'Link tài liệu không đúng định dạng Google Drive', statusCode.ERROR);
            }

            if (docType === 'PDF') {
                const {files} = req;
                if (files && files[0]) {
                    const fileData = await UploadService.upload(files, 'binary', 'doc-exams');
                    if (fileData && fileData.length > 0) {
                        exam.doc_link = config.FILE_DOMAIN + '/' + fileData[0];
                    }
                }
            }

            if (subjectID)
                exam.subject = {id: subject.id, name: subject.name};

            if (categoryID) {
                const category = await ExamCategoryModel.findOne({_id: categoryID});
                if (category)
                    exam.category = {id: category.id, name: category.name};
            }

            if (timeExam)
                exam.time = timeExam;

            if (isRedo)
                exam.is_redo = isRedo || true;

            if (group)
                exam.group = group;

            if (answerDocLink)
                exam.answer_doc_link = answerDocLink;

            if (examDocLink)
                exam.exam_doc_link = examDocLink;

            if (level)
                exam.level = level;

            if (creatingType)
                exam.creating_type = creatingType;

            if (classroomId) {
                exam.classroom_id = classroomId;
                await this.addClassroom(id, classroomId);
            }

            if (isPayFee)
                exam.is_pay_fee = isPayFee;

            if (configPointTrueFalse)
                exam.point_true_false = configPointTrueFalse;


            const rs = await ExamModel.updateOne({_id: id}, {$set: exam});

            return response(res, rs, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.ERROR, statusCode.ERROR);
        }
    }


    async createSectionInExamManual(req, res, params) {
        try {
            const examId = params.exam_id || null;
            const examSectionName = params.exam_section_name || null;
            let examSectionId = params.exam_section_id || null;
            const examSectionOrder = parseInt(params.exam_section_order) || 0;
            const sectionType = params.section_type || appConfig.EXAM_SECTION_TYPE.DEFAULT;
            const examSectionGroupName = params.exam_section_group_name || null;
            const examLink = params.exam_link || null;
            const totalScore = parseInt(params.total_score) || 0;
            const subjectInGroup = params.subject_in_group || [];
            const examSectionTime = parseInt(params.exam_section_time) || 0;
            const numberSubjectRequire = parseInt(params.number_subject_require) || 1;
            const calculateScoreType = params.calculate_score_type || null;
            const examSectionGroupOrder = parseInt(params.exam_section_group_order) || 0;
            const examSectionGroupId = params.exam_section_group_id || null;
            const pointPerQuestion = params.point_per_question || null;

            //create section
            //check type section
            //type = group -> create group -> create

            if (!examId) {
                return response(res, null, 'Không tìm thấy đề thi tương ứng!', statusCode.ERROR);
            }

            const docSection = {
                exam_id: examId,
                exam_section_name: examSectionName,
                exam_section_type: sectionType,
                exam_section_order: examSectionOrder,
                exam_section_time: examSectionTime,
                total_score: totalScore,
                calculate_score_type: calculateScoreType,
                exam_link: examLink,
                point_per_question: pointPerQuestion,
            }

            let section = {};

            if (!examSectionId) {
                //tao section va them group
                const section_db = await ExamSectionModel.create(docSection);
                section = JSON.parse(JSON.stringify(section_db));
                examSectionId = section.id;
            }

            if (sectionType === appConfig.EXAM_SECTION_TYPE.DEFAULT) {
                return response(res, section, 'Tạo phần thi thành công!', statusCode.OK);
            }

            let group = {};
            if (examSectionGroupId) {
                group = await ExamSectionGroupModel.findOne({_id: examSectionGroupId});
            } else if (examSectionGroupName) {
                //tao group
                const docGroup = {
                    exam_id: examId,
                    exam_section_id: examSectionId,
                    exam_section_group_name: examSectionGroupName,
                    number_subject_require: numberSubjectRequire,
                    exam_section_group_order: examSectionGroupOrder,
                }
                group = await ExamSectionGroupModel.create(docGroup);
            }

            let groupInSection = []
            if (group) {
                const docUpdateSubject = {$set: {subjects: subjectInGroup}};
                await ExamSectionGroupModel.updateOne({_id: group.id}, docUpdateSubject);

                groupInSection = await ExamSectionGroupModel.find({exam_section_id: examSectionId});
            }

            section['exam_section_group'] = groupInSection;
            return response(res, section, 'Tạo phần thi thành công!', statusCode.OK)
        } catch (e) {
            logError(e);
            return response(res, {}, language.ERROR, statusCode.ERROR);
        }
    }

    async updateSection(req, res, params) {
        try {

            const examId = params.exam_id || null;
            const examSectionName = params.exam_section_name || null;
            let examSectionId = params.exam_section_id || null;
            const examSectionOrder = parseInt(params.exam_section_order) || null;
            const sectionType = params.section_type || null;
            const examLink = params.exam_link || null;
            const totalScore = parseInt(params.total_score) || null;
            const examSectionTime = parseInt(params.exam_section_time) || null;
            const calculateScoreType = params.calculate_score_type || null;
            const pointPerQuestion = params.point_per_question || null;

            if (!examId || !examSectionId) {
                return response(res, null, 'Không tìm thấy đề thi/phần thi tương ứng!', statusCode.ERROR);
            }

            const section = await ExamSectionModel.findOne({_id: examSectionId, exam_id: examId});


            if (!section) {
                return response(res, null, 'Không tìm thấy phần thi tương ứng!', statusCode.ERROR);
            }

            if (examSectionName)
                section.exam_section_name = examSectionName;

            if (examSectionOrder)
                section.exam_section_order = examSectionOrder;

            if (sectionType)
                section.exam_section_type = sectionType;

            if (examLink)
                section.exam_link = examLink;

            if (totalScore)
                section.total_score = totalScore;

            if (examSectionTime)
                section.exam_section_time = examSectionTime;

            if (calculateScoreType)
                section.calculate_score_type = calculateScoreType;

            if (pointPerQuestion)
                section.point_per_question = pointPerQuestion;


            const rs = await ExamSectionModel.updateOne({_id: examSectionId}, {$set: section});

            return response(res, rs, 'Update phần thi thành công!', statusCode.OK)
        } catch (e) {
            logError(e);
            return response(res, {}, language.ERROR, statusCode.ERROR);
        }
    }

    async updateGroup(req, res, params) {
        try {

            const examId = params.exam_id || null;
            let examSectionId = params.exam_section_id || null;
            const examSectionGroupName = params.exam_section_name || null;
            const subjectInGroup = params.subject_in_group || [];
            const numberSubjectRequire = parseInt(params.number_subject_require) || 1;
            const examSectionGroupOrder = parseInt(params.exam_section_group_order) || 0;
            const examSectionGroupId = params.exam_section_group_id || null;

            //create section
            //check type section
            //type = group -> create group -> create

            if (!examId || !examSectionId || !examSectionGroupId) {
                return response(res, null, 'Không tìm thấy đề thi tương ứng!', statusCode.ERROR);
            }

            const group = await ExamSectionGroupModel.findOne({
                _id: examSectionGroupId,
                exam_id: examId,
                exam_section_id: examSectionId
            });
            if (!group) {
                return response(res, null, 'Không tìm thấy nhóm trong phần thi tương ứng!', statusCode.ERROR);
            }

            if (examSectionGroupName)
                group.exam_section_group_name = examSectionGroupName

            if (numberSubjectRequire)
                group.number_subject_require = numberSubjectRequire

            if (examSectionGroupOrder)
                group.exam_section_order = examSectionGroupOrder;

            if (subjectInGroup)
                group.subjects = subjectInGroup;

            const rs = await ExamSectionGroupModel.updateOne({_id: examSectionGroupId}, {$set: group});

            return response(res, rs, 'Update nhóm trong phần thi thành công!', statusCode.OK)
        } catch (e) {
            logError(e);
            return response(res, {}, language.ERROR, statusCode.ERROR);
        }
    }


    async createQuestionv2(req, res, params) {
        try {
            const examId = params.exam_id || null;
            const examSectionId = params.exam_section_id || null;
            const examSectionGroupId = params.exam_section_group_id || null;
            const subjectId = params.subject_id || null;
            const questionNo = params.question_no || null;
            const question = params.question || null;
            const questionJson = params.question_json || null;
            const type = params.type || appConfig.QUESTION_TYPE.TN_SINGLE_CHOICE;
            const answer = params.answer || null;
            const answerContent = params.answer_content || null;
            const docLink = params.doc_link || null;
            const docType = params.doc_type || null;
            const videLink = params.video_link || null;

            if (!examId) {
                return response(res, null, 'Không tìm thấy đề thi tương ứng!', statusCode.ERROR);
            }

            let docQuestionV2 = {
                exam_id: examId,
                exam_section_id: examSectionId,
                exam_section_group_id: examSectionGroupId,
                subject_id: subjectId,
                question_no: questionNo,
                question: question,
                question_json: questionJson,
                type: type,
                answer: answer,
                answer_content: answerContent,
                doc_link: docLink,
                doc_type: docType,
                video_link: videLink,
                status: true,
            }

            let rsQuestion = await AppService.createQuestionV2(docQuestionV2);

            if (!rsQuestion) {
                return response(res, null, 'Xảy ra lỗi khi tạo câu hỏi!', statusCode.ERROR);
            }

            return response(res, rsQuestion, 'Tạo câu hỏi thành công!', statusCode.OK)
        } catch (e) {
            return response(res, {}, language.ERROR, statusCode.ERROR);
        }
    }

    async updateQuestionv2(req, res, params) {
        try {
            const { 
                exam_id: examId, 
                question_id: questionId, 
                subject_id: subjectId,
                question_no: questionNo,
                question,
                question_json: questionJson,
                type,
                answer,
                answer_content: answerContent,
                doc_link: docLink,
                doc_type: docType,
                video_link: videoLink
            } = params;
    
            // Validate required parameters
            if (!examId || !questionId) {
                return response(res, null, 'Không tìm thấy đề thi tương ứng!', statusCode.ERROR);
            }
    
            // Check if question exists
            const existingQuestion = await QuestionV2Model.findOne({
                _id: questionId, 
                exam_id: examId
            });
    
            if (!existingQuestion) {
                return response(res, null, 'Không tìm thấy câu hỏi tương ứng!', statusCode.ERROR);
            }
    
            // Build update object with only provided fields
            const updateFields = {};
            
            // Build update object dynamically
            const fieldsToUpdate = {
                subject_id: subjectId,
                question_no: questionNo,
                question: question,
                question_json: questionJson,
                type: type,
                answer: answer,
                answer_content: answerContent,
                doc_link: docLink,
                doc_type: docType,
                video_link: videoLink
            };
    
            // Filter out only null/undefined values (allow empty strings)
            Object.keys(fieldsToUpdate).forEach(key => {
                if (fieldsToUpdate[key] !== null && fieldsToUpdate[key] !== undefined) {
                    updateFields[key] = fieldsToUpdate[key];
                }
            });
    
            // Perform update and fetch updated document in one operation
            const updatedQuestion = await QuestionV2Model.findOneAndUpdate(
                { _id: questionId, exam_id: examId },
                { $set: updateFields },
                { 
                    new: true, // Return updated document
                    runValidators: true // Run schema validations
                }
            );
    
            if (!updatedQuestion) {
                return response(res, null, 'Cập nhật câu hỏi thất bại!', statusCode.ERROR);
            }
    
            return response(res, updatedQuestion, 'Cập nhật câu hỏi thành công!', statusCode.OK);
    
        } catch (error) {
            logError(error);
            return response(res, null, language.ERROR, statusCode.ERROR);
        }
    }

    async detail(req, res, params) {
        try {

            const examId = params.exam_id || null;
            const creatingType = params.creating_type || null;

            if (!examId || !creatingType) {
                return response(res, null, 'Không tìm thấy đề thi!', statusCode.ERROR);
            }

            let rs = {};
            let isStudent = req.user.user_group === appConfig.USER_GROUP.STUDENT

            rs = await this.getExamDetail(examId, isStudent, rs);

            return response(res, rs, 'Thành công', statusCode.OK);
        } catch (e) {
            logError(e);
            return response(res, null, language.ERROR, statusCode.ERROR);
        }
    }


    async getExamDetail(examId, isStudent, rs) {
        let total_ques = await QuestionV2Model.count({exam_id: examId, deleted_at: null});
        let total_time_doing = 0;
        let exam_total_score = 0;
        const exam_db = await ExamModel.findOne({_id: examId});
        let exam = JSON.parse(JSON.stringify(exam_db));
        const exam_type = exam.type;

        if (exam.creating_type === appConfig.EXAM_CREATING_TYPE.GROUP_QUESTION) {
            //add questions vo
            if (!isStudent)
                exam['questions'] = await QuestionV2Model.find({exam_id: examId, deleted_at: null});
            rs = exam
        }

        if (exam.creating_type === appConfig.EXAM_CREATING_TYPE.MANUAL) {
            total_ques = 0;
            const sections_db = await ExamSectionModel.find({exam_id: examId});
            let sections = JSON.parse(JSON.stringify(sections_db));
            for (let i = 0; i < sections.length; i++) {
                let sectionId = sections[i]._id;
                let sectionType = sections[i].exam_section_type;
                total_time_doing = total_time_doing + parseInt(sections[i].exam_section_time);
                exam_total_score = exam_total_score + BaseHelper.round2Decimal(sections[i].total_score);

                if (sectionType === appConfig.EXAM_SECTION_TYPE.DEFAULT) {
                    if (!isStudent) {
                        sections[i]['questions'] = await QuestionV2Model.find({
                            exam_id: examId,
                            exam_section_id: sectionId,
                            deleted_at: null
                        });
                    } else {
                        let count  = await QuestionV2Model.count({
                            exam_id: examId,
                            exam_section_id: sectionId,
                            deleted_at: null
                        });
                        total_ques = total_ques + count;
                    }
                }


                if (sectionType === appConfig.EXAM_SECTION_TYPE.GROUP_SUBJECT) {
                    const groups_db = await ExamSectionGroupModel.find({exam_id: examId, exam_section_id: sectionId});
                    let groups = JSON.parse(JSON.stringify(groups_db));
                    for (let i = 0; i < groups.length; i++) {
                        let groupId = groups[i]._id;
                        let subjects = groups[i].subjects;
                        if ((!subjects || subjects.length === 0)) {
                            if (!isStudent) {
                                groups[i]['questions'] = await QuestionV2Model.find({
                                    exam_id: examId,
                                    exam_section_id: sectionId,
                                    exam_section_group_id: groupId,
                                    deleted_at: null
                                });
                            } else {
                                let count  = await QuestionV2Model.count({
                                    exam_id: examId,
                                    exam_section_id: sectionId,
                                    exam_section_group_id: groupId,
                                    deleted_at: null
                                });
                                total_ques = total_ques + count;
                            }
                        } else {
                            for (let j = 0; j < subjects.length; j++) {
                                let subjectId = subjects[j].subject_id;

                                if (!isStudent) {
                                    let ques = await QuestionV2Model.find({
                                        exam_id: examId,
                                        exam_section_id: sectionId,
                                        exam_section_group_id: groupId,
                                        subject_id: subjectId,
                                        deleted_at: null
                                    });

                                    subjects[j] = {
                                        ...subjects[j],
                                        questions: ques
                                    }
                                } else {
                                    let count  = await QuestionV2Model.count({
                                        exam_id: examId,
                                        exam_section_id: sectionId,
                                        exam_section_group_id: groupId,
                                        subject_id: subjectId,
                                        deleted_at: null
                                    });
                                    total_ques = total_ques + count;
                                }

                            }
                            groups[i]['subjects'] = subjects;
                        }
                    }
                    sections[i]['exam_section_group'] = groups;
                }
            }

            exam['exam_section'] = sections;
            if (appConfig.NEW_EXAM_TYPE.TOT_NGHIEP === exam_type || appConfig.NEW_EXAM_TYPE.APT === exam_type) {
                exam['is_take_section'] = false;
                exam['total_time_doing'] = parseInt(exam.time);
            }

            if (appConfig.NEW_EXAM_TYPE.HSA === exam_type || appConfig.NEW_EXAM_TYPE.TSA === exam_type) {
                exam['is_take_section'] = true;
                exam['total_time_doing'] = total_time_doing;
            }

            exam['total_ques'] = total_ques;
            exam['exam_total_score'] = exam_total_score;
            if (appConfig.NEW_EXAM_TYPE.HSA === exam_type) {
                exam['total_ques'] = 150;
                exam['exam_total_score'] = 150;
            }
            //find section add vo
            rs = exam;
        }

        return rs;
    }

    async deleteExam(req, res, params) {
        const {ids} = params || [];

        if (ids.length === 0)
            return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);

        try {
            const rs = await ExamModel.delete({_id: {$in: ids}}, true);

            await ExamSectionModel.delete({exam_id: {$in: ids}}, true);
            await ExamSectionGroupModel.delete({exam_id: {$in: ids}}, true);

            return response(res, rs, 'Thành công', statusCode.OK);
        } catch (e) {
            return response(res, null, language.ERROR, statusCode.ERROR);
        }
    }

    async deleteExamSection(req, res, params) {
        const exam_id = params.exam_id;
        const section_exam_id = params.exam_section_id;

        if (!exam_id || !section_exam_id)
            return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);

        try {
            const rs = await ExamSectionModel.delete({_id: section_exam_id}, true);
            await ExamSectionGroupModel.delete({exam_id: exam_id, exam_section_id: section_exam_id}, true);

            return response(res, rs, 'Thành công', statusCode.OK);
        } catch (e) {
            return response(res, null, language.ERROR, statusCode.ERROR);
        }
    }

    async deleteExamSectionGroup(req, res, params) {
        const exam_section_group_id = params.exam_section_group_id;

        if (!exam_section_group_id)
            return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);

        try {
            const rs = await ExamSectionGroupModel.delete({_id: exam_section_group_id});

            return response(res, rs, 'Thành công', statusCode.OK);
        } catch (e) {
            return response(res, null, language.ERROR, statusCode.ERROR);
        }
    }

    async deleteQuestion(req, res, params) {
        try {
            const {ids} = params || [];
            if (ids.length === 0)
                return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);

            const rs = await QuestionV2Model.softDelete({_id: {$in: ids}}, true);

            return response(res, rs, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.ERROR, statusCode.ERROR);
        }
    }

    async formatQuestion(questions_db) {
        let questions = JSON.parse(JSON.stringify(questions_db));
        questions.forEach(function (v) {
            v['question_no_string'] = 'Câu ' + v.question_no;
            if (v.answer instanceof Object && appConfig.QUESTION_TYPE.TN_TRUE_FALSE === v.type) {
                v['num_ques'] = Object.keys(v.answer).length;
            }

            if (v.answer instanceof Array && appConfig.QUESTION_TYPE.DRAG_DROP === v.type) {
                let listLocation = [];
                let listAnswer = [];
                for (let j = 0; j < v.answer.length; j++) {
                    let obj = v.answer[j];
                    if (obj.key)
                        listLocation.push({'id': obj.key, 'text': obj.key});
                    listAnswer.push({'id': obj.value, 'text': obj.value});
                }
                v['location'] = listLocation;
                v['answer_for_location'] = lodash.shuffle(listAnswer);
            }

            delete v.answer;
        });
        return questions;
    };


    async letFile(req, res, params) {
        const examId = params.exam_id;
        const sectionId = params.section_id || null;
        const groupId = params.group_id || null;
        const subjectIdInGroup = params.subject_in_group || [];

        try {
            let pdfUrls = [];
            const exam_db = await ExamModel.findOne({_id: examId});
            const exam_type = exam_db.type;

            if (appConfig.NEW_EXAM_TYPE.TOT_NGHIEP === exam_type || appConfig.NEW_EXAM_TYPE.APT === exam_type) {
                pdfUrls.push(exam_db.exam_doc_link);
            }

            if (appConfig.NEW_EXAM_TYPE.HSA === exam_type || appConfig.NEW_EXAM_TYPE.TSA === exam_type) {
                const section_db = await ExamSectionModel.findOne({_id: sectionId, exam_id: examId})
                if (appConfig.NEW_EXAM_TYPE.TSA === exam_type)
                    pdfUrls.push(section_db.exam_link);

                if (appConfig.NEW_EXAM_TYPE.HSA === exam_type) {
                    if (!groupId) {
                        pdfUrls.push(section_db.exam_link);
                    } else {
                        const group = await ExamSectionGroupModel.findOne({
                            _id: groupId,
                            exam_id: examId,
                            exam_section_id: sectionId
                        });
                        let subjects = group.subjects;
                        for (let i = 0; i < subjectIdInGroup.length; i++) {
                            let obj = subjects.find(o => o.subject_id === subjectIdInGroup[i]);

                            if (obj) pdfUrls.push(obj.exam_link);
                        }

                    }
                }
            }

            const mergedPdfBytes = await DriveService.getFilePDF(pdfUrls);

            // Send the merged PDF as a response
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=merged.pdf');
            res.send(Buffer.from(mergedPdfBytes));
        } catch (error) {
            logError(error);
            return response(res, {}, language.ERROR, statusCode.ERROR);
        }
    }

    async letQuestion(req, res, params) {
        const examId = params.exam_id;
        const sectionId = params.section_id;
        const groupId = params.group_id || null;
        const subjectIdInGroup = params.subject_in_group || [];

        let options_ques = {sort: {question_no: 1}}
        try {
            const exam_db = await ExamModel.findOne({_id: examId});
            let exam = JSON.parse(JSON.stringify(exam_db));
            const exam_type = exam.type;

            if (appConfig.NEW_EXAM_TYPE.TOT_NGHIEP === exam_type) {
                //find sections
                const sections_db = await ExamSectionModel.find({exam_id: examId});
                let sections = JSON.parse(JSON.stringify(sections_db));
                for (let i = 0; i < sections.length; i++) {
                    let _sectionId = sections[i]._id;
                    const questions_db = await QuestionV2Model.find({
                        exam_id: examId,
                        exam_section_id: _sectionId,
                        deleted_at: null
                    }, null, options_ques);
                    sections[i]['questions'] = await this.formatQuestion(questions_db);
                }

                exam['exam_section'] = sections;
            }

            if (appConfig.NEW_EXAM_TYPE.APT === exam_type) {
                //find sections
                const sections_db = await ExamSectionModel.find({exam_id: examId});
                let sections = JSON.parse(JSON.stringify(sections_db));
                for (let i = 0; i < sections.length; i++) {
                    let _sectionId = sections[i]._id;
                    //check have group
                    const groups_db = await ExamSectionGroupModel.find({exam_id: examId, exam_section_id: _sectionId});
                    if (groups_db && groups_db.length > 0) {
                        let groups = JSON.parse(JSON.stringify(groups_db));
                        for (let i = 0; i < groups.length; i++) {
                            let _groupId = groups[i]._id;
                            const questions_db = await QuestionV2Model.find({
                                exam_id: examId,
                                exam_section_id: _sectionId,
                                exam_section_group_id: _groupId,
                                deleted_at: null
                            }, null, options_ques);
                            groups[i]['questions'] = await this.formatQuestion(questions_db);
                        }
                        sections[i]['exam_section_group'] = groups;
                    } else {
                        const questions_db = await QuestionV2Model.find({
                            exam_id: examId,
                            exam_section_id: _sectionId,
                            deleted_at: null
                        }, null, options_ques);
                        sections[i]['questions'] = await this.formatQuestion(questions_db);
                    }

                }
                exam['exam_section'] = sections;
            }

            if (appConfig.NEW_EXAM_TYPE.HSA === exam_type || appConfig.NEW_EXAM_TYPE.TSA === exam_type) {
                const section_db = await ExamSectionModel.findOne({_id: sectionId});
                if (!section_db) {
                    return response(res, null, 'Không tìm thấy phần thi!', statusCode.ERROR);
                }
                let section = JSON.parse(JSON.stringify(section_db));
                //check group
                if (groupId) {
                    const group_db = await ExamSectionGroupModel.findOne({_id: groupId});
                    if (!group_db) {
                        return response(res, null, 'Không tìm thấy phần thi!', statusCode.ERROR);
                    }
                    let group = JSON.parse(JSON.stringify(group_db));
                    let subjects = group.subjects;
                    let subjects_rn = [];
                    for (let i = 0; i < subjectIdInGroup.length; i++) {
                        let obj = subjects.find(o => o.subject_id === subjectIdInGroup[i]);
                        const questions_db = await QuestionV2Model.find({
                            exam_id: examId,
                            exam_section_id: sectionId,
                            exam_section_group_id: groupId,
                            subject_id: obj.subject_id,
                            deleted_at: null
                        }, null, options_ques);

                        obj['questions'] = await this.formatQuestion(questions_db);
                        subjects_rn.push(obj);
                    }
                    group['subjects'] = subjects_rn;
                    section['exam_section_group'] = group;
                } else {
                    const questions_db = await QuestionV2Model.find({
                        exam_id: examId,
                        exam_section_id: sectionId,
                        deleted_at: null
                    }, null, options_ques);
                    section['questions'] = await this.formatQuestion(questions_db);
                }

                Object.assign(exam, section);
            }


            return response(res, exam, 'Thành công', statusCode.OK);
        } catch (err) {
            return response(res, null, language.ERROR, statusCode.ERROR);
        }

    }

    async scoring(req, res, params) {
        try {
            let examId = params.exam_id;
            let userId = req.user.user_id;
            let examKey = params.exam_key || null;

            // HSA vs TSA
            let sectionId = params.section_id;
            let groupId = params.group_id || null;
            let subjectInGroup = params.subject_in_group || null;

            let questions_answer = params.answers || [];

            let timeDoing = params.time_doing || 0;
            if (0 < timeDoing < 1) timeDoing = 1;

            let totalExamPoint = 0;
            let totalScoreAchieve = 0;
            let totalQuestion = 0;
            let classroom_id = params.classroom_id || null;

            if (!userId) {
                return response(res, null, 'Thiếu thông tin thời điểm thi!', statusCode.ERROR)
            }
            const exam_db = await ExamModel.findOne({_id: examId});
            const examType = exam_db.type;

            let conditions = {
                user_id: userId,
                exam_id: params.exam_id,
                deleted_at: null,
            };
            const options = {
                limit: 1,
                sort: {created_at: -1}
            };

            if (appConfig.NEW_EXAM_TYPE.TOT_NGHIEP === examType || appConfig.NEW_EXAM_TYPE.APT === examType) {
                const _scoreCheck = await ScoreHistoryModel.findOne(conditions,null, options);
                if (_scoreCheck && !exam_db.is_redo)
                    return response(res, {}, MESSAGE, statusCode.ERROR);
            }

            if (appConfig.NEW_EXAM_TYPE.HSA === examType || appConfig.NEW_EXAM_TYPE.TSA === examType) {
                const _scoreCheck = await ScoreHistoryModel.findOne(conditions,null, options);
                const exam_section = _scoreCheck?.['exam_section'];
                if (exam_section && exam_section.length > 0) {
                    for (let i = 0; i < exam_section.length; i++) {
                        if (sectionId === exam_section[i]._id  && !exam_db.is_redo) {
                            return response(res, {}, MESSAGE, statusCode.ERROR);
                        }
                    }
                }
            }

            const user = await UserModel.findOne({_id: userId});
            let userSave = {id: user._id, code: user.code, name: user.fullname};
            const creatingType = exam_db.creating_type;

            if (appConfig.EXAM_CREATING_TYPE.MANUAL !== creatingType) {
                return response(res, null, 'Không thể chấm điểm. Đề thi không phù hợp!', statusCode.ERROR)
            }

            let sectionExam = []
            if (appConfig.NEW_EXAM_TYPE.TOT_NGHIEP === examType) {
                const sections_db = await ExamSectionModel.find({exam_id: examId});
                for (let i = 0; i < sections_db.length; i++) {
                    let _section = sections_db[i];
                    let sectionRs = JSON.parse(JSON.stringify(_section));
                    let sectionPoint = await ScoringService.pointBySection(sectionRs, examId, questions_answer, exam_db, classroom_id);

                    totalScoreAchieve = totalScoreAchieve + BaseHelper.round2Decimal(sectionPoint.score);
                    totalExamPoint = totalExamPoint + BaseHelper.round2Decimal(sectionPoint.total_point);
                    totalQuestion = totalQuestion + parseInt(sectionPoint.total_question);

                    sectionExam.push(sectionPoint)
                }

                const _docCH = {
                    user_id: userId,
                    exam_id: examId,
                    user: userSave,
                    classroom_id: classroom_id,
                    exam_key: examKey,
                    exam_name: exam_db.name,
                    type: exam_db.type,
                    time_doing: Math.round(timeDoing),
                    ques_answer_doing: questions_answer.length,
                    total_score_achieve: totalScoreAchieve ? totalScoreAchieve : 0,
                    total_exam_point: totalExamPoint ? totalExamPoint : 0,
                    total_question: totalQuestion ? totalQuestion : 0,
                    exam_section: sectionExam
                }
                await ScoreHistoryModel.create(_docCH)
            }

            if (appConfig.NEW_EXAM_TYPE.APT === examType) {
                const sections_db = await ExamSectionModel.find({exam_id: examId});
                let sectionExam = [];
                for (let i = 0; i < sections_db.length; i++) {
                    let _section = sections_db[i];
                    let sectionRs = JSON.parse(JSON.stringify(_section));

                    const groups_db = await ExamSectionGroupModel.find({
                        exam_id: examId,
                        exam_section_id: _section._id
                    });
                    let sectionPoint = {};
                    if (groups_db && groups_db.length > 0) {
                        sectionPoint = await ScoringService.pointBySectionGroup(groups_db, sectionRs, examId, questions_answer, exam_db, classroom_id);
                        sectionExam.push(sectionPoint)
                    } else {
                        sectionPoint = await ScoringService.pointBySection(sectionRs, examId, questions_answer, exam_db, classroom_id);
                        sectionExam.push(sectionPoint)
                    }

                    totalScoreAchieve = totalScoreAchieve + BaseHelper.round2Decimal(sectionPoint.score);
                    totalExamPoint = totalExamPoint + BaseHelper.round2Decimal(sectionPoint.total_point);
                    totalQuestion = totalQuestion + parseInt(sectionPoint.total_question);
                }

                const _docCH = {
                    user_id: userId,
                    classroom_id: classroom_id,
                    exam_id: examId,
                    exam_key: examKey,
                    user: userSave,
                    exam_name: exam_db.name,
                    type: exam_db.type,
                    time_doing: Math.round(timeDoing),
                    ques_answer_doing: questions_answer.length,
                    total_score_achieve: totalScoreAchieve ? totalScoreAchieve : 0,
                    total_exam_point: totalExamPoint ? totalExamPoint : 0,
                    total_question: totalQuestion ? totalQuestion : 0,
                    exam_section: sectionExam
                }
                await ScoreHistoryModel.create(_docCH)
            }

            if (appConfig.NEW_EXAM_TYPE.TSA === examType) {
                const _section = await ExamSectionModel.findOne({_id: sectionId, exam_id: examId});
                let sectionRs = JSON.parse(JSON.stringify(_section));
                let sectionPoint = await ScoringService.pointBySection(sectionRs, examId, questions_answer, exam_db, classroom_id);

                await this.saveScoreHistory(userId, examId, examKey, sectionPoint, exam_db, Math.round(timeDoing), questions_answer.length, classroom_id, userSave);

            }

            if (appConfig.NEW_EXAM_TYPE.HSA === examType) {
                const _section = await ExamSectionModel.findOne({exam_id: examId, _id: sectionId});
                let sectionRs = JSON.parse(JSON.stringify(_section));
                let sectionPoint = {};

                if (groupId) {
                    sectionPoint = await ScoringService.pointBySectionGroupSubject(sectionRs, examId, questions_answer, exam_db, groupId, subjectInGroup, classroom_id);
                } else {
                    sectionPoint = await ScoringService.pointBySection(sectionRs, examId, questions_answer, exam_db, classroom_id);
                }


                const scHis = await this.saveScoreHistory(userId, examId, examKey, sectionPoint, exam_db, Math.round(timeDoing), questions_answer.length, classroom_id, userSave);
            }

            return response(res, null, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, {}, language.ERROR, statusCode.ERROR);
        }
    }

    async getScore(req, res, params) {
        try {
            let examId = params.exam_id;
            let userId = req.user.user_id;
            let examKey = params.exam_key || null;

            if (!examId)
                return response(res, null, 'Vui lòng nhập đủ thông tin!', statusCode.ERROR);

            let _scoreHis = {};

            if (examKey) {
                _scoreHis = await ScoreHistoryModel.findOne({exam_id: examId, user_id: userId, exam_key: examKey});
            } else {
                const options = {
                    limit: 1,
                    sort: {created_at: -1}
                };
                _scoreHis = await ScoreHistoryModel.findOne({user_id: userId, exam_id: examId}, null, options);
            }

            return response(res, _scoreHis, 'Thành công', statusCode.OK);
        } catch (e) {
            logError(e);
            return response(res, {}, language.ERROR, statusCode.ERROR);
        }
    }

    async answerLink(req, res, params) {
        try {
            let examId = params.exam_id;

            if (!examId)
                return response(res, null, 'Vui lòng nhập đủ thông tin!', statusCode.ERROR);

            let pdfUrls = [];
            const exam_db = await ExamModel.findOne({_id: examId});
            const answer_doc_link = exam_db.answer_doc_link;

            if (!answer_doc_link || answer_doc_link.length === 0) {
                res.status(500).send('Không tìm thấy tài liệu đáp án!');
            } else {
                pdfUrls.push(answer_doc_link);
                const mergedPdfBytes = await DriveService.getFilePDF(pdfUrls);

                // Send the merged PDF as a response
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', 'attachment; filename=merged.pdf');
                res.send(Buffer.from(mergedPdfBytes));
            }
        } catch (error) {
            logError(error);
            return response(res, {}, language.ERROR, statusCode.ERROR);
        }
    }


    async saveScoreHistory(userId, examId, examKey, sectionPoint, exam_db, timeDoing, quesDoing, classroom_id, userSave) {
        const _scoreHistory = await ScoreHistoryModel.findOne({user_id: userId, exam_id: examId, exam_key: examKey});
        let scoreHistory = JSON.parse(JSON.stringify(_scoreHistory));
        if (scoreHistory) {
            //update
            let exam_section = scoreHistory.exam_section;
            exam_section.push(sectionPoint);

            let total_question = _scoreHistory.total_question + sectionPoint.total_question;
            let ques_answer_doing = _scoreHistory.ques_answer_doing + quesDoing;
            let total_score_achieve = _scoreHistory.total_score_achieve ? _scoreHistory.total_score_achieve + sectionPoint.score : 0 + sectionPoint.score;
            let total_exam_point = _scoreHistory.total_exam_point + sectionPoint.total_point;
            let time_doing = _scoreHistory.time_doing + timeDoing;
            if (time_doing === 0) time_doing = 1;
            await ScoreHistoryModel.updateOne({_id: scoreHistory._id},
                {
                    exam_section: exam_section,
                    total_question: total_question,
                    ques_answer_doing: ques_answer_doing,
                    total_score_achieve: total_score_achieve ? total_score_achieve : 0,
                    total_exam_point: total_exam_point ? total_exam_point : 0,
                    time_doing: Math.round(time_doing),
                    classroom_id: classroom_id
                }
            );
        } else {
            if (timeDoing === 0) timeDoing = 1;
            const _docCH = {
                user_id: userId,
                user: userSave,
                exam_id: examId,
                classroom_id: classroom_id,
                exam_key: examKey,
                exam_name: exam_db.name,
                total_question: sectionPoint.total_question,
                ques_answer_doing: quesDoing,
                total_score_achieve: sectionPoint.score,
                total_exam_point: sectionPoint.total_point,
                time_doing: Math.round(timeDoing),
                type: exam_db.type,
                exam_section: [sectionPoint]
            }

            await ScoreHistoryModel.create(_docCH)
        }
    }

    async viewScoreDetailExam(req, res, params) {
        try {
            const userId = req.user.user_id;
            const examId = params.exam_id || null;
            const examKey = params.exam_key || null;

            if (!userId || !examId) {
                return response(res, null, 'Không thể tìm thấy bài thi tương ứng!', statusCode.ERROR);
            }

            let conditions = {user_id: userId, exam_id: examId};

            let scoreHistory = {};
            if (examKey) {
                conditions.exam_key = examKey;
                scoreHistory = await ScoreHistoryModel.findOne(conditions);
            } else {
                const options = {
                    limit: 1,
                    sort: {created_at: -1}
                };
                scoreHistory = await ScoreHistoryModel.findOne(conditions, null, options);
            }

            return response(res, scoreHistory, 'Thành công!', statusCode.SUCCESS);
        } catch (e) {
            return response(res, {}, language.ERROR, statusCode.ERROR)
        }
    }

    async viewFileInScoreDetailExam(req, res, params) {
        const userId = req.user.user_id;
        const examId = params.exam_id || null;
        const examKey = params.exam_key || null;

        if (!userId || !examId) {
            return response(res, null, 'Không thể tìm thấy bài thi tương ứng!', statusCode.ERROR);
        }
        try {
            let conditions = {user_id: userId, exam_id: examId};

            let examScoreHistory = {};
            if (examKey) {
                conditions.exam_key = examKey;
                examScoreHistory = await ScoreHistoryModel.findOne(conditions);
            } else {
                const options = {
                    limit: 1,
                    sort: {created_at: -1}
                };
                examScoreHistory = await ScoreHistoryModel.findOne(conditions, null, options);
            }
            let pdfUrls = [];
            const exam_type = examScoreHistory.type;

            if (appConfig.NEW_EXAM_TYPE.TOT_NGHIEP === exam_type || appConfig.NEW_EXAM_TYPE.APT === exam_type) {
                pdfUrls.push(examScoreHistory.exam_doc_link);
            }

            if (appConfig.NEW_EXAM_TYPE.HSA === exam_type || appConfig.NEW_EXAM_TYPE.TSA === exam_type) {
                const sections = examScoreHistory.exam_section
                for (let i = 0; i < sections.length; i++) {
                    const section_db = sections[i];
                    if (appConfig.NEW_EXAM_TYPE.TSA === exam_type)
                        pdfUrls.push(section_db.exam_link);

                    if (appConfig.NEW_EXAM_TYPE.HSA === exam_type) {
                        const groups = section_db.exam_section_group;

                        if (groups && groups.length > 0) {
                            const group = groups[0];
                            let subjects = group.subjects;
                            for (let i = 0; i < subjects.length; i++) {
                                pdfUrls.push(subjects[i].exam_link);
                            }
                        } else {
                            pdfUrls.push(section_db.exam_link);
                        }
                    }
                }

            }

            const mergedPdfBytes = await DriveService.getFilePDF(pdfUrls);

            // Send the merged PDF as a response
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=merged.pdf');
            res.send(Buffer.from(mergedPdfBytes));

        } catch (error) {
            logError(error);
            return response(res, null, language.ERROR, statusCode.ERROR);

        }

    }

     async addClassroom(examID, classroomID) {
         const exam = await ExamModel.findOne({ _id: examID });
         const classroom = await ClassroomModel.findOne({ _id: classroomID });
         let examClassroom = await ExamClassroomModel.findOne({ exam_id: examID, 'classroom.id': classroomID });
         if (examClassroom)
             return null;

         const docExamClassroom = {
             type: exam.type,
             exam_id: examID,
             exam: {
                 id: exam.id,
                 name: exam.name,
                 code: exam.code
             },
             classroom: {
                 id: classroomID,
                 name: classroom.name,
                 code: classroom.code
             },
             subject: classroom.subject,
             status: 'PENDING'
         };
         return await ExamClassroomModel.create(docExamClassroom);
     }

    async report(req, res, params) {
        try {
            const examID = params.id || null;
            const classroomID = params.classroom_id || null;
            if (!examID || !classroomID)
                return response(res, {}, 'Request không hợp lệ!', statusCode.ERROR);
            const exam = await ExamModel.findOne({_id: examID});

            if (!exam)
                return response(res, {}, 'Đề thi không tồn tại!', statusCode.ERROR);

            const conditions = {deleted_at: null};
            conditions['exam_id'] = examID;
            conditions['classroom_id'] = classroomID;
            const options = {sort: {total_score_achieve: -1}};
            const projections = '_id user exam num_right num_wrong total_score_achieve created_at started_at finished_at';
            const testings = await ScoreHistoryModel.find(conditions, projections, options);
            let avgPoint = 0;
            let totalPoint = 0;

            let PR1 = 0; // < lv1
            let PR2 = 0; // Từ lv1 đến lv2
            let PR3 = 0; // Từ lv2 đến lv3
            let PR4 = 0; //Lớn hơn lv3
            let PR0 = 0; // chưa làm bài

            const scoreLvl = appConfig.EXAM_REPORT_SCORE[exam.type]
            for (let i = 0; i < testings.length; i++) {
                totalPoint += testings[i].total_score_achieve;
                if (testings[i].total_score_achieve < scoreLvl.LEVEL_1)
                    PR1++;
                if (testings[i].total_score_achieve >= scoreLvl.LEVEL_1 && testings[i].total_score_achieve <= scoreLvl.LEVEL_2)
                    PR2++;
                if (testings[i].total_score_achieve >= scoreLvl.LEVEL_2 && testings[i].total_score_achieve <= scoreLvl.LEVEL_3)
                    PR3++;
                if (testings[i].total_score_achieve > scoreLvl.LEVEL_3)
                    PR4++;
            }

            PR0 = testings.length - (PR1 + PR2 + PR3 + PR4);

            if (testings.length > 0)
                avgPoint = totalPoint / testings.length;

            const students = await StudentClassroomModel.find({'classroom.id': classroomID, deleted_at: null});

            const testingQuestions = await QuestionV2ReportModel.find({exam_id: examID, classroom_id: classroomID});

            const questions_db = await QuestionV2Model.find({exam_id: examID, deleted_at: null});

            let questionsResult = []

            for (let question of testingQuestions) {
                let obj = questions_db.find(ques => ques._id.toString() === question.question_id.toString())
                let ques_rs = JSON.parse(JSON.stringify(question));
                ques_rs['question_no'] = obj['question_no'];
                questionsResult.push(ques_rs);
            }

            const data = {
                testings,
                students,
                total_student: students.length,
                avg_point: Math.round(avgPoint),
                total_testing: testings.length,
                testing_questions: questionsResult,
                PR1: {name: 'Nhỏ hơn ' + scoreLvl.LEVEL_1, value: PR1},
                PR2: {name: 'Từ ' + scoreLvl.LEVEL_1 + ' - ' + scoreLvl.LEVEL_2, value: PR2},
                PR3: {name: 'Từ ' + scoreLvl.LEVEL_2 + ' - ' + scoreLvl.LEVEL_3, value: PR3},
                PR4: {name: 'Lớn hơn ' + scoreLvl.LEVEL_3, value: PR4},
                PR0: {name: 'Chưa làm', value: PR0}
            };
            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, {}, language.ERROR, statusCode.ERROR);
        }
    }

    async verifyExam(req, res, params) {
        try {
            const userId = req.user.user_id;
            let conditions = {
                user_id: userId,
                exam_id: params.exam_id,
                deleted_at: null,
            };
            const exam = await ExamModel.findOne({_id: params.exam_id});

            const _score = await ScoreHistoryModel.find(conditions);

            if (!exam)
                return response(res, {}, 'Đề thi không tồn tại!', statusCode.ERROR);

            if (_score && _score.length > 0 && !exam.is_redo)
                return response(res, {}, MESSAGE, statusCode.ERROR);
            else
                return response(res, {}, 'Thành công', statusCode.OK);

        } catch (err) {
            console.log(err)
        }
    }

    async stopExam(req, res, params) {
        const userId = req.user.user_id;
        let conditions = {
            user_id: userId,
            exam_id: params.exam_id,
            exam_key: params.exam_key,
            deleted_at: null,
        };
        if (!params.exam_key)
            return response(res, {}, 'Xin vui lòng nhập đủ thông tin!', statusCode.ERROR);

        await ScoreHistoryModel.delete(conditions);
        return response(res, {}, 'Thành công', statusCode.OK);

    }

}





module.exports = new Exam_v2Controller();