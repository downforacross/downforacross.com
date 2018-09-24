import {reduce} from '../utils/ComposeOperations';
import HistoryWrapper from './historyWrapper';

export default class CompositionHistoryWrapper extends HistoryWrapper {
  get reduce() {
    return reduce;
  }
}
