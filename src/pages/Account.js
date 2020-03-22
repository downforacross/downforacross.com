import './css/account.css';

import React, {Component} from 'react';
import Nav from '../components/common/Nav';

function AccountHistory() {
  return <div className="account-history">Account History</div>;
}

export default class Account extends Component {
  constructor() {
    super();
    this.state = {
      panel: null,
    };

    this.panels = {
      history: {
        name: 'History',
        component: AccountHistory,
      },
    };
  }

  selectPanel(panel) {
    this.setState({
      panel,
    });
  }

  renderSidebar() {
    const {panel: selectedPanel} = this.state;
    return (
      <div className="account--sidebar">
        {' '}
        {Object.keys(this.panels).map((panelKey) => {
          const selected = panelKey === selectedPanel;
          const {name} = this.panels[panelKey];
          return <div className={`account--sidebar--entry ${selected ? ' selected' : ''}`}>{name}</div>;
        })}
      </div>
    );
  }

  renderPanel() {
    const {panel} = this.state;
    if (panel) {
      const {component} = this.panels[panel];
      if (component) return component();
    }
  }

  render() {
    return (
      <div className="account">
        <Nav />
        <div className="account--title">Your Account</div>
        <div className="account--main">
          <div className="account--left">{this.renderSidebar()}</div>
          <div className="account--right">{this.renderPanel()}</div>
        </div>
      </div>
    );
  }
}
