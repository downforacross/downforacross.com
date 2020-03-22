import {reduce} from '../reducers/compose';
import HistoryWrapper from './HistoryWrapper';

export default class CompositionHistoryWrapper extends HistoryWrapper {
  get reduce() {
    return reduce;
  }
}
