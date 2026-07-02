import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { removeClassroom, getQuestionClassrooms } from '../../redux/question/action';

class ClassroomRow extends Component {
    constructor(props) {
        super();
        this.state = {
            obj: '',
        };
    }

    handleCheck = async () => {
        const data = {
            question_id: this.props.obj.question_id,
            classroom_id: this.props.obj.classroom.id,
        };
        await this.props.removeClassroom(data);
        await this.props.getQuestionClassrooms({ question_id: this.props.obj.question_id });
    };

    render() {
        return (
            <tr className="v-middle" data-id={17}>
                <td>{this.props.index + 1}</td>
                <td className="flex">{this.props.obj.classroom.name}</td>
                <td>
                    <button
                        className="btn btn-sm btn-default"
                        onClick={this.handleCheck}>
                        Bỏ chọn
					</button>
                </td>
            </tr>
        );
    }
}

function mapStateToProps(state) {
    return {};
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({ removeClassroom, getQuestionClassrooms }, dispatch);
}

export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(ClassroomRow),
);
