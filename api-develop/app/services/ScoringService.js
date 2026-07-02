const appConfig = require("../../config/app");
const QuestionV2Model = require("../models/Question_v2");
const ExamSectionGroupModel = require("../models/ExamSectionGroup");
const QuestionV2ReportModel = require("../models/QuestionV2Report");
const lodash = require("lodash");
const BaseHelper = require('../helpers/BaseHelper');


class ScoringService {

    async pointBySection(_section, examId, questions_answer, exam_db, classroom_id) {
        let totalPoint = 100;
        if (appConfig.CALCULATE_SCORE_TYPE.TOTAL_POINT === _section.calculate_score_type?.toString().toUpperCase()) {
            totalPoint = _section.total_score;
        }

        let _sectionId = _section._id;

        const questions_correct = await QuestionV2Model.find({
            exam_id: examId,
            exam_section_id: _sectionId,
            deleted_at: null
        });
        if (!questions_correct || questions_correct.length === 0) {
            _section['score'] = 0;
            _section['total_point'] = 0;
            _section['total_question'] = 0;
            return _section
        }

        if (appConfig.CALCULATE_SCORE_TYPE.COUNT_TRUE === _section.calculate_score_type?.toString().toUpperCase()) {
            totalPoint = questions_correct.length;
        }

        let pointPerQuestion = Math.round((totalPoint / questions_correct.length) * 100) / 100; //round to at most 2 decimal places
        _section['score'] = await this.scoring(questions_correct, questions_answer, exam_db.point_true_false, pointPerQuestion, exam_db, classroom_id);
        _section['total_point'] = totalPoint;
        _section['total_question'] = questions_correct.length;
        _section['correct_questions'] = questions_correct;
        _section['answer_questions'] = questions_answer;
        return _section;
    }

    async pointBySectionGroup(groups_db, _section, examId, questions_answer, exam_db, classroom_id) {
        let totalPoint = 100;
        if (appConfig.CALCULATE_SCORE_TYPE.TOTAL_POINT === _section.calculate_score_type?.toString().toUpperCase()) {
            totalPoint = _section.total_score;
        }

        let groupRs = [];
        let _sectionId = _section._id;

        const questionsCorrect = await QuestionV2Model.find({
            exam_id: examId,
            exam_section_id: _sectionId,
            deleted_at: null
        });

        if (appConfig.CALCULATE_SCORE_TYPE.COUNT_TRUE === _section.calculate_score_type?.toString().toUpperCase()) {
            totalPoint = questionsCorrect.length;
        }

        let pointPerQuestion = Math.round((totalPoint / questionsCorrect.length) * 100) / 100; //round to at most 2 decimal places

        let scoreSec = 0;
        for (let i = 0; i < groups_db.length; i++) {
            let group = JSON.parse(JSON.stringify(groups_db[i]));
            let groupId = group._id;
            let questionsCorrectByGroup = questionsCorrect.filter(ques =>
                ques.exam_id === examId && ques.exam_section_id === _sectionId && ques.exam_section_group_id === groupId
            )

            group['score'] = await this.scoring(questionsCorrectByGroup, questions_answer, exam_db.point_true_false, pointPerQuestion, exam_db, classroom_id);
            scoreSec = scoreSec + BaseHelper.round2Decimal(group.score);
            group['correct_questions'] = questionsCorrectByGroup;
            group['answer_questions'] = questions_answer.filter(ans => questionsCorrectByGroup.some(ques => ques._id.toString() === ans._id.toString()));
            groupRs.push(group);
        }
        _section['total_question'] = questionsCorrect.length;
        _section['score'] = scoreSec;
        _section['total_point'] = totalPoint;
        _section['exam_section_group'] = groupRs;
        return _section;

    }

    async pointBySectionGroupSubject(_section, examId, questions_answer, exam_db, groupId, subjectInGroup, classroom_id) {
        let totalPoint = 100;
        if (appConfig.CALCULATE_SCORE_TYPE.TOTAL_POINT === _section.calculate_score_type?.toString().toUpperCase()) {
            totalPoint = _section.total_score;
        }

        let subjectRs = [];
        let _sectionId = _section._id;
        const group_db = await ExamSectionGroupModel.findOne({_id: groupId});
        const subjects = group_db.subjects;

        let _group = JSON.parse(JSON.stringify(group_db));
        const questionsCorrect = await QuestionV2Model.find({
            exam_id: examId,
            exam_section_id: _sectionId,
            exam_section_group_id: groupId,
            subject_id: {$in: subjectInGroup},
            deleted_at: null
        });

        if (appConfig.CALCULATE_SCORE_TYPE.COUNT_TRUE === _section.calculate_score_type?.toString().toUpperCase()) {
            totalPoint = questionsCorrect.length;
        }

        let pointPerQuestion = Math.round((totalPoint / questionsCorrect.length) * 100) / 100; //round to at most 2 decimal places


        if (appConfig.NEW_EXAM_TYPE.HSA === exam_db.type) {
            totalPoint = questionsCorrect.length;
            pointPerQuestion = _section.point_per_question;
        }

        let scoreSec = 0;
        for (let i = 0; i < subjectInGroup.length; i++) {
            let subjectObj = subjects.find(o => o.subject_id.toString() === subjectInGroup[i].toString());
            let _subject = JSON.parse(JSON.stringify(subjectObj));

            let questionsCorrectBySubject = questionsCorrect.filter(ques =>
                ques.exam_id === examId &&
                ques.exam_section_id === _sectionId &&
                ques.exam_section_group_id === groupId &&
                ques.subject_id === subjectInGroup[i]
            )

            _subject['score'] = await this.scoring(questionsCorrectBySubject, questions_answer, exam_db.point_true_false, pointPerQuestion, exam_db, classroom_id);
            scoreSec = scoreSec + BaseHelper.round2Decimal(_subject.score);
            _subject['correct_questions'] = questionsCorrectBySubject;
            _subject['answer_questions'] = questions_answer.filter(ans => questionsCorrectBySubject.some(ques => ques._id.toString() === ans._id.toString()));
            subjectRs.push(_subject);
        }
        _group['subjects'] = subjectRs
        _section['exam_section_group'] = [_group];
        _section['total_question'] = questionsCorrect.length;
        _section['score'] = scoreSec;
        _section['total_point'] = totalPoint;

        return _section;
    }


    async scoring(questions_correct, questions_answer, configTNTrueFalse, pointPerQuestion, exam, classroom_id) {
        let score = 0;
        let questionTrue = [];
        let questionFalse = [];
        for (let i = 0; i < questions_correct.length; i++) {
            let isPoint = false;
            let ques_id = questions_correct[i]._id;
            let correctAnswer = questions_correct[i].answer;
            let obj = await questions_answer.find(o => o._id.toString() === ques_id.toString());
            if (!obj) continue;
            const question_type = questions_correct[i].type;
            let answer = obj.answer;

            if (lodash.isEmpty(answer)) {
                continue;
            }

            if (appConfig.QUESTION_TYPE.ESSAY === question_type) {
                let answer_c = answer.toUpperCase().trim().replace(/,/g, '.');
                let correct_c = correctAnswer?.toUpperCase().trim().replace(/,/g, '.');
                let correct_c_arr = [];
                if (correct_c)
                    correct_c_arr = correct_c.split(";")

                if (correct_c_arr.includes(answer_c)) {
                    score = score + pointPerQuestion;
                    isPoint = true;
                }
            }

            if (appConfig.QUESTION_TYPE.TN_SINGLE_CHOICE === question_type && answer.toUpperCase() === correctAnswer?.toUpperCase()) {
                score = score + pointPerQuestion;
                isPoint = true;
            }

            if (appConfig.QUESTION_TYPE.TN_TRUE_FALSE === question_type) {
                const normalizedCorrectAnswer = this.normalizeTrueFalseAnswer(correctAnswer);
                const normalizedUserAnswer = this.normalizeTrueFalseAnswer(answer);
                let correct_num = await this.findMatchingFields(normalizedCorrectAnswer, normalizedUserAnswer);
                const totalTrueFalseFields = Object.keys(normalizedCorrectAnswer).length;

                if (appConfig.NEW_EXAM_TYPE.TSA === exam.type) {
                    score = score + ((correct_num === totalTrueFalseFields) ? pointPerQuestion : 0);
                    isPoint = true;
                } else {
                    if (!configTNTrueFalse) continue;
                    score = score + ((pointPerQuestion * configTNTrueFalse[correct_num.toString()]) / 100);
                    if  (correct_num === totalTrueFalseFields) {
                        isPoint = true;
                    }
                }
            }

            if (appConfig.QUESTION_TYPE.TRUE_FALSE === question_type && answer.toUpperCase().trim() === correctAnswer?.toUpperCase().trim()) {
                score = score + pointPerQuestion;
                isPoint = true;
            }

            if (appConfig.QUESTION_TYPE.TN_MULTI_CHOICE === question_type) {
                correctAnswer = correctAnswer.replace(/\s+/g, '');
                answer = answer.replace(/\s+/g, '');
                let correctAnswerArr = correctAnswer.split(',');
                let answerArr = answer.split(',');
                let inA2ButNotInA1 = answerArr.filter(x => !correctAnswerArr.includes(x.toString()));

                if (inA2ButNotInA1.length === 0 && correctAnswerArr.length === answerArr.length) {
                    score = score + pointPerQuestion;
                    isPoint = true;
                }
            }

            if (appConfig.QUESTION_TYPE.DRAG_DROP === question_type) {
                isPoint = true;
                for (let i = 0; i < answer.length; i++) {
                    let obj = correctAnswer.find(o => o.key.toString() === answer[i].key.toString() && o.value.toString() === answer[i].value.toString());
                    if (!obj) {
                        isPoint = false;
                    }
                }
                if (isPoint) score = score + pointPerQuestion;
            }
            isPoint === true ? questionTrue.push(ques_id) : questionFalse.push(ques_id);
        }

        if (classroom_id)
            await this.reportQuestion(questionTrue, questionFalse, questions_correct, exam, classroom_id);

        score = score? score : 0;
        score = Math.round(score * 100) /100;
        return score? score : 0;
    }

    async findMatchingFields(obj1, obj2) {
        try {
            const matchingFields = {};

            for (const key in obj1) {
                if (obj1.hasOwnProperty(key) && obj2.hasOwnProperty(key)) {
                    if (obj1[key] === obj2[key]) {
                        matchingFields[key] = obj1[key];
                    }
                }
            }

            return Object.keys(matchingFields ? matchingFields : {}).length;
        } catch (e) {
            return 0;
        }

    }

    normalizeTrueFalseAnswer(answer) {
        if (!answer) return {};

        if (Array.isArray(answer)) {
            const normalizedFromArray = {};
            answer.forEach((value, index) => {
                normalizedFromArray[String.fromCharCode(97 + index)] = this.normalizeTrueFalseValue(value);
            });
            return normalizedFromArray;
        }

        if (typeof answer === 'object') {
            const normalizedFromObject = {};
            Object.keys(answer).forEach((key) => {
                normalizedFromObject[key.toString().trim().toLowerCase()] = this.normalizeTrueFalseValue(answer[key]);
            });
            return normalizedFromObject;
        }

        return {};
    }

    normalizeTrueFalseValue(value) {
        if (typeof value === 'string') {
            const lowered = value.trim().toLowerCase();
            if (lowered === 'true') return true;
            if (lowered === 'false') return false;
            return lowered;
        }

        return value;
    }

    async reportQuestion(questionTrue, questionFalse, questions_correct, exam, classroom_id) {
        const reportExists = await QuestionV2ReportModel.find({exam_id: exam._id, classroom_id: classroom_id});
        let createReport = []
        for (const question of questions_correct) {
            let exist = reportExists.find(obj => obj.question_id === question._id.toString());
            if (!exist) {
                createReport.push({
                    exam_id: exam._id,
                    question_id: question._id,
                    question_code: question.code,
                    classroom_id: classroom_id,
                    total_right: 0,
                    total_wrong: 0
                })
            }
        }

        if (createReport)
            await QuestionV2ReportModel.create(createReport);

        if (questionFalse)
            await QuestionV2ReportModel.updateMany({question_id: {$in: questionTrue}}, {$inc: {total_right: +1}})

        if (questionTrue)
            await QuestionV2ReportModel.updateMany({question_id: {$in: questionFalse}}, {$inc: {total_wrong: +1}})
    }
}

module.exports = new ScoringService();