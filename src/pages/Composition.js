import 'react-flexview/lib/flexView.css'

import React, { Component } from 'react';
import Nav from '../components/Nav';
import _ from 'lodash';
import { Helmet } from 'react-helmet';
import Flex from 'react-flexview';

import Editor from '../components/Editor';
import { CompositionModel, getUser } from '../store';
import ComposeHistoryWrapper from '../utils/ComposeHistoryWrapper';
import Game from '../components/Game';
import ChatV2 from '../components/ChatV2';
import redirect from '../redirect';
import { isMobile } from '../jsUtils';
import { makeGridFromComposition, makeClues } from '../gameUtils';

export default class Composition extends Component {
  constructor(props) {
    super();
    this.state = {
      gid: undefined,
      mobile: isMobile(),
    };
  }

  get cid() {
    return parseInt(this.props.match.params.cid, 10);
  }

  get composition() {
    return this.historyWrapper.getSnapshot();
  }

  initializeUser() {
    this.user = getUser();
    this.user.onAuth(() => {
      this.forceUpdate();
    });
  }

  initializeComposition() {
    this.compositionModel = new CompositionModel(`/composition/${this.cid}`);
    console.log('initialize composition');
    this.historyWrapper = new ComposeHistoryWrapper();
    this.compositionModel.on('createEvent', event => {
      this.historyWrapper.setCreateEvent(event);
      this.handleUpdate();
    });
    this.compositionModel.on('event', event => {
      this.historyWrapper.addEvent(event);
      this.handleUpdate();
    });
    this.compositionModel.attach();
    console.log('attached')
  }

  componentDidMount() {
    this.initializeComposition();
    this.initializeUser();
  }

  componentWillUnmount() {
    if (this.compositionModel) this.compositionModel.detach();
  }

  handlePressEnter = (el) => {
    if (el === this.chat) {
      this.game && this.game.focus();
    } else if (el === this.game) {
      this.chat && this.chat.focus();
    }
  }

  handleUpdate = _.debounce(() => {
    this.forceUpdate();
  }, 0, {
    leading: true,
  });

  handleChange = _.debounce(({isEdit = true, isPublished = false} = {}) => {
    const composition = this.historyWrapper.getSnapshot();
    if (isEdit) {
      const { title, author } = composition.info;
      this.user.joinComposition(this.cid, {
        title,
        author,
        published: isPublished,
      });
    }
  });

  handleUpdateGrid = (r, c, value) => {
    this.compositionModel.updateCellText(r, c, value);
  }

  handleFlipColor = (r, c) => {
    const color = this.composition.grid[r][c].value === '.' ? 'white' : 'black';
    this.compositionModel.updateCellColor(r, c, color);
  }

  handleUpdateClue = (r, c, dir, value) => {
    this.compositionModel.updateClue(r, c, dir, value);
  }



  // ================
  // Render Methods

  getCellSize() {
    return 30 * 15 / this.composition.grid[0].length;
  }

  renderEditor() {
    if (!this.compositionModel || !this.compositionModel.attached) {
      return;
    }

    const { mobile } = this.state;
    const { id, color } = this.user;

    const gridObject = makeGridFromComposition(this.composition.grid);
    const grid = gridObject.grid;
    const clues = makeClues(this.composition.clues, grid);
    return (
      <Editor
        ref='editor'
        size={this.getCellSize()}
        grid={grid}
        clues={clues}
        onUpdateGrid={this.handleUpdateGrid}
        onUpdateClue={this.handleUpdateClue}
        onChange={this.handleChange}
        onFlipColor={this.handleFlipColor}
        myColor={this.color}
      />
    );
  }

  renderChat() {
    if (!this.gameModel || !this.gameModel.attached) {
      return;
    }

    const { id, color } = this.user;
    return (
      <ChatV2
        ref={c => {this.chat = c;}}
        id={id}
        myColor={color}
        historyWrapper={this.historyWrapper}
        gameModel={this.gameModel}
        onPressEnter={this.handlePressEnter}
      />
    );
  }

  get title() {
    if (!this.compositionModel || !this.compositionModel.attached) {
      return;
    }
    const info = this.composition.info;
    return `Compose: ${info.title}`;
  }

  render() {
    const style = {
      padding: 20,
    };
    return (
      <Flex className='composition' column grow={1}
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        <Helmet>
          <title>{this.title}</title>
        </Helmet>
        <Nav v2 hidden={this.state.mobile}/>
        <Flex style={style} grow={1}>
          <Flex column shrink={0}>
            { this.renderEditor() }
          </Flex>
          <Flex grow={1}>
            { this.showingChat && this.renderChat() }
          </Flex>
        </Flex>
      </Flex>
    );
  }
}


