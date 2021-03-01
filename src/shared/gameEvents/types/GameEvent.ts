import allEventDefs from '../allEventDefs';
import {EventType} from './GameEventType';
import {ExtractParamsType} from './ExtractParamsType';

export interface GameEvent<T extends EventType = EventType> {
  type: T;
  params: ExtractParamsType<typeof allEventDefs[T]>;
  timestamp?: number;
}
