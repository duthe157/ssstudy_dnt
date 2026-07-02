import React, { Component } from 'react';
import {bindActionCreators} from 'redux';
import {
	BrowserRouter as Router,
	withRouter,
} from 'react-router-dom';
import {connect} from 'react-redux';
import Moment from 'moment';

class HeadingSortColumn extends Component {
    constructor(props) {
        super();
        this.state = {
            name: props.name,
            value: props.value,
            content: props.content,
            sort_key: props.sort_key,
            sort_value: props.sort_value
        };
        this.wrapperRef = React.createRef()
    }

    async componentDidMount() {
        this.setState({
            name: this.props.name,
            value: this.props.value,
            content: this.props.content,
            sort_key: this.props.sort_key,
            sort_value: this.props.sort_value
        })
    }


    UNSAFE_componentWillReceiveProps(nextProps) {
        if (this.props.name != nextProps.name) {
            this.setState({
                name: nextProps.name
            })
        }
        if (this.props.value != nextProps.value) {
            this.setState({
                value: nextProps.value
            })
        }
        if (this.props.content != nextProps.content) {
            this.setState({
                content: nextProps.content
            })
        }

        if (nextProps.sort_key) {
            this.setState({
                sort_key: nextProps.sort_key
            })
        }
        if (nextProps.sort_value) {
            this.setState({
                sort_value: nextProps.sort_value
            })
        }

    }

    sort = (event) => {
        this.props.handleSort(event);
    }


    render() {

        let {name, value, content, sort_key, sort_value } = this.state;

        let { customClass, width } = this.props;

        return (
            <th
                name={name}
                width={width}
                onClick={(e) => this.sort(e)}
                // className={`text-left sorting ${sort_key && sort_value ? (sort_key == name && sort_value === 1 ? "up" : sort_key == name && sort_value === -1 ? "down" : "") : ""}`}
                className={`${customClass ? customClass : "text-left"} sorting ${sort_key && sort_value ? (sort_key == name && sort_value == 1 ? "up" : sort_key == name && sort_value == -1 ? "down" : "") : ""}`}
            >
                {content}
            </th>
        );
    }
}

function mapStateToProps(state) {
    return {
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
        },
        dispatch,
    );
}

let Container = withRouter(
    connect(mapStateToProps, mapDispatchToProps)(HeadingSortColumn),
);
export default Container;
