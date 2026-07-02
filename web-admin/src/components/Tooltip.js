import React, { Component } from 'react';
import PropTypes from 'prop-types';
// import '../../public/assets/css/tooltip.css';

export default class Tooltip extends Component {
  constructor() {
    super();
  }

  render() {

    console.log("this.props. childrem", this.props.children)

    return (
      <div className='tooltip'>
        <div className='tooltip-content top'>
            {this.props.content}
        </div>
        {this.props.children}
      </div>
    );
  }
}

Tooltip.propTypes = {
  content: PropTypes.string.isRequired
};