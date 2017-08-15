import React, { Component } from 'react';
import UploadComponent from '../components/upload';

export default class Upload extends Component {
  render() {
    return (
      <UploadComponent
        history={this.props.history}
      >
      </UploadComponent>
    );
  }
};
