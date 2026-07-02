import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import data from "../../test.json";
import BaseHelpers from "../../helpers/BaseHelpers";
class Test extends Component {
    constructor(props) {
        super();
        this.state = {
        };
    }

    renderQuestion(data) {
        const question = data.question;
        if (data && question && question instanceof Array) {
            return question.map((object, i) => {
                const _content = BaseHelpers.renderQuestionHTML(object);
                return (
                    <span dangerouslySetInnerHTML={{ __html: _content }}></span>
                );
            });
        }
    }

    fetchQuestionOption(data) {
        if (data && data instanceof Array) {
            return data.map((object, i) => {
                const _content = BaseHelpers.renderQuestionHTML(object);
                return (
                    <span dangerouslySetInnerHTML={{ __html: _content }}></span>
                );
            });
        }
    }

    fetchQuesion(data) {
        const questions = data.content;
        if (data && questions && questions instanceof Array) {
            return questions.map((question, i) => {
                return (<div key={i} className="api-question-item">
                    <div className="api-list-question-preview"><b>Câu {i + 1}:</b> {this.renderQuestion(question)}</div>
                    <div className="api-list-option">
                        {question.A ? <span className="api-question-option-item"><strong>A:</strong> {this.fetchQuestionOption(question.A)} {question.correct && question.correct === 'A' ? <span><img src="/assets/img/icon-check-done.svg" className="ml-12" alt=""/></span> : <></>}</span> : <></>}
                        {question.B ? <span className="api-question-option-item"><strong>B:</strong> {this.fetchQuestionOption(question.B)} {question.correct && question.correct === 'B' ? <span><img src="/assets/img/icon-check-done.svg" className="ml-12" alt=""/></span> : <></>}</span> : <></>}
                        {question.C ? <span className="api-question-option-item"><strong>C:</strong> {this.fetchQuestionOption(question.C)} {question.correct && question.correct === 'C' ? <span><img src="/assets/img/icon-check-done.svg" className="ml-12" alt=""/></span> : <></>}</span> : <></>}
                        {question.D ? <span className="api-question-option-item"><strong>D:</strong> {this.fetchQuestionOption(question.D)} {question.correct && question.correct === 'D' ? <span><img src="/assets/img/icon-check-done.svg" className="ml-12" alt=""/></span> : <></>}</span> : <></>}
                    </div>
                </div >
                );
            })
        }
    }

    async componentDidMount() {
    }


    render() {
        return (
            <div style={{ background: '#fff' }}>
                {this.fetchQuesion(data)}
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {

    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {},
        dispatch
    );
}

let ExamContainer = withRouter(
    connect(mapStateToProps, mapDispatchToProps)(Test)
);
export default ExamContainer;
