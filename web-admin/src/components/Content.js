import React, {Component} from 'react';
import {BrowserRouter as Router, Route, Link} from 'react-router-dom';
import Student from './student/Student';
import Video from './video/Video';
import ExamWarehouse from './exam/ExamWarehouse1';
import Exam from './testing/Testing';
import Dashboard from './Dashboard';

export default class Content extends Component {
	constructor(props) {
		super();
	}
	render() {
		return (
			<div>
				<Route
					exact
					path={`${this.props.match.path}/dashboard`}
					component={Dashboard}
				/>
				<Route
					exact
					path={`${this.props.match.path}/videos`}
					component={Video}
				/>
				<Route
					exact
					path={`${this.props.match.path}/students`}
					component={Student}
				/>

				<Route
					exact
					path={`${this.props.match.path}/exams`}
					component={Exam}
				/>
				<Route
					exact
					path={`${this.props.match.path}/exam-warehouse`}
					component={ExamWarehouse}
				/>
			</div>
		);
	}
}
