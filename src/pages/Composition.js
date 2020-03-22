import 'react-flexview/lib/flexView.css';
import './css/composition.css';

import React, {Component} from 'react';
import Nav from '../components/common/Nav';
import _ from 'lodash';
import {Helmet} from 'react-helmet';
import Flex from 'react-flexview';

import actions from '../actions';
import Editor from '../components/Player/Editor';
import FileUploader from '../components/Upload/FileUploader';
import {CompositionModel, getUser} from '../store';
import ComposeHistoryWrapper from '../lib/wrappers/ComposeHistoryWrapper';
import Chat from '../components/Chat';
import EditableSpan from '../components/common/EditableSpan';
import redirect from '../lib/redirect';
import {downloadBlob, isMobile} from '../lib/jsUtils';
import {
  makeGridFromComposition,
  makeClues,
  convertCluesForComposition,
  convertGridForComposition,
} from '../lib/gameUtils';
import format from '../lib/format';
import * as xwordFiller from '../components/Compose/lib/xword-filler';

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

  get showingChat() {
    return this.historyWrapper && this.historyWrapper.createEvent;
  }

  initializeUser() {
    this.user = getUser();
    this.user.onAuth(() => {
      this.forceUpdate();
    });
  }

  initializeComposition() {
    this.compositionModel = new CompositionModel(`/composition/${this.cid}`);
    this.historyWrapper = new ComposeHistoryWrapper();
    this.compositionModel.on('createEvent', (event) => {
      this.historyWrapper.setCreateEvent(event);
      this.handleUpdate();
    });
    this.compositionModel.on('event', (event) => {
      this.historyWrapper.addEvent(event);
      this.handleUpdate();
    });
    this.compositionModel.attach();
  }

  componentDidMount() {
    this.initializeComposition();
    this.initializeUser();
  }

  componentWillUnmount() {
    if (this.compositionModel) this.compositionModel.detach();
  }

  get title() {
    if (!this.compositionModel || !this.compositionModel.attached) {
      return;
    }
    const info = this.composition.info;
    return `Compose: ${info.title}`;
  }

  get otherCursors() {
    return _.filter(this.composition.cursors, ({id}) => id !== this.user.id);
  }

  handlePressEnter = (el) => {
    if (el === this.chat) {
      this.game && this.game.focus();
    } else if (el === this.game) {
      this.chat && this.chat.focus();
    }
  };

  handleUpdate = _.debounce(
    () => {
      this.forceUpdate();
    },
    0,
    {
      leading: true,
    }
  );

  handleChange = _.debounce(({isEdit = true, isPublished = false} = {}) => {
    const composition = this.historyWrapper.getSnapshot();
    if (isEdit) {
      const {title, author} = composition.info;
      this.user.joinComposition(this.cid, {
        title,
        author,
        published: isPublished,
      });
    }
  });

  handleUpdateGrid = (r, c, value) => {
    this.compositionModel.updateCellText(r, c, value);
  };

  handleFlipColor = (r, c) => {
    const color = this.composition.grid[r][c].value === '.' ? 'white' : 'black';
    this.compositionModel.updateCellColor(r, c, color);
  };

  handleUpdateClue = (r, c, dir, value) => {
    this.compositionModel.updateClue(r, c, dir, value);
  };

  handleUploadSuccess = (puzzle, filename = '') => {
    const {info, grid, circles, clues} = puzzle;
    const convertedGrid = convertGridForComposition(grid);
    const gridObject = makeGridFromComposition(convertedGrid);
    const convertedClues = convertCluesForComposition(clues, gridObject);
    this.compositionModel.import(filename, {
      info,
      grid: convertedGrid,
      circles,
      clues: convertedClues,
    });
    this.handleChange();
  };

  handleUploadFail = () => {};

  handleChat = (username, id, message) => {
    this.compositionModel.chat(username, id, message);
    this.handleChange();
  };

  handleUpdateTitle = (title) => {
    this.compositionModel.updateTitle(title);
    this.handleChange();
  };

  handleUpdateAuthor = (author) => {
    this.compositionModel.updateAuthor(author);
    this.handleChange();
  };

  handleUnfocusHeader = () => {
    this.chat && this.chat.focus();
  };

  handleUnfocusEditor = () => {
    this.chat && this.chat.focus();
  };

  handleUnfocusChat = () => {
    this.editor && this.editor.focus();
  };

  handleExportClick = () => {
    const byteArray = format()
      .fromComposition(this.composition)
      .toPuz();
    downloadBlob(byteArray, 'download.puz');
  };

  handleUpdateCursor = (selected) => {
    const {r, c} = selected;
    const {id, color} = this.user;
    this.compositionModel.updateCursor(r, c, id, color);
  };

  handleAutofill = () => {
    console.log('c.grid', this.composition.grid);
    const grid = xwordFiller.fillGrid(this.composition.grid);
    console.log('grid', grid);
    this.compositionModel.setGrid(grid);
  };

  handleChangeSize = (newRows, newCols) => {
    const oldGrid = this.composition.grid;
    const oldRows = oldGrid.length;
    const oldCols = oldGrid[0].length;
    const newGrid = _.range(newRows).map((i) =>
      _.range(newCols).map((j) => (i < oldRows && j < oldCols ? oldGrid[i][j] : {value: ''}))
    );
    this.compositionModel.setGrid(newGrid);
  };

  handleChangeRows = (newRows) => {
    if (newRows > 0) {
      this.handleChangeSize(newRows, this.composition.grid[0].length);
    }
  };

  handleChangeColumns = (newCols) => {
    if (newCols > 0) {
      this.handleChangeSize(this.composition.grid.length, newCols);
    }
  };

  handlePublish = () => {
    let {grid, clues, info} = this.composition;

    clues = makeClues(clues, makeGridFromComposition(grid).grid);
    grid = grid.map((row) => row.map(({value}) => value || '.'));

    const puzzle = {grid, clues, info};

    actions.createPuzzle(puzzle, (pid) => {
      console.log('Puzzle path: ', `/beta/play/${pid}`);
      redirect(`/beta/play/${pid}`);
    });
  };

  handleClearPencil = () => {
    this.compositionModel.clearPencil();
  };

  getCellSize() {
    return (30 * 15) / this.composition.grid[0].length;
  }

  renderEditor() {
    if (!this.compositionModel || !this.compositionModel.attached) {
      return;
    }

    const {mobile} = this.state;
    const {id, color} = this.user;

    const gridObject = makeGridFromComposition(this.composition.grid);
    const grid = gridObject.grid;
    const clues = makeClues(this.composition.clues, grid);
    const cursors = this.otherCursors;

    return (
      <Editor
        ref={(c) => {
          this.editor = c;
        }}
        size={this.getCellSize()}
        grid={grid}
        clues={clues}
        cursors={cursors}
        onUpdateGrid={this.handleUpdateGrid}
        onAutofill={this.handleAutofill}
        onClearPencil={this.handleClearPencil}
        onUpdateClue={this.handleUpdateClue}
        onUpdateCursor={this.handleUpdateCursor}
        onChange={this.handleChange}
        onFlipColor={this.handleFlipColor}
        onPublish={this.handlePublish}
        onChangeRows={this.handleChangeRows}
        onChangeColumns={this.handleChangeColumns}
        myColor={this.user.color}
        onUnfocus={this.handleUnfocusEditor}
      />
    );
  }

  renderChatHeader() {
    const {title, author, type} = this.composition.info;

    return (
      <div className="chat--header">
        <EditableSpan
          className="chat--header--title"
          key_="title"
          onChange={this.handleUpdateTitle}
          onBlur={this.handleUnfocusHeader}
          value={title}
        />

        <EditableSpan
          className="chat--header--subtitle"
          key_="author"
          onChange={this.handleUpdateAuthor}
          onBlur={this.handleUnfocusHeader}
          value={author}
        />
      </div>
    );
  }

  renderChat() {
    const {id, color} = this.user;
    return (
      <Chat
        ref={(c) => {
          this.chat = c;
        }}
        header={this.renderChatHeader()}
        info={this.composition.info}
        data={this.composition.chat}
        id={id}
        myColor={color}
        onChat={this.handleChat}
        onUnfocus={this.handleUnfocusChat}
      />
    );
  }

  render() {
    const style = {
      padding: 20,
    };
    return (
      <Flex
        className="composition"
        column
        grow={1}
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        <Helmet>
          <title>{this.title}</title>
        </Helmet>
        <Nav v2 hidden={this.state.mobile} />
        <Flex style={style} grow={1}>
          <Flex column shrink={0}>
            {this.renderEditor()}
          </Flex>
          <Flex grow={1}>{this.showingChat && this.renderChat()}</Flex>
          <Flex column>
            <FileUploader success={this.handleUploadSuccess} fail={this.handleUploadFail} v2 />
            <button onClick={this.handleExportClick}>Export to puz</button>
          </Flex>
        </Flex>
      </Flex>
    );
  }
}
