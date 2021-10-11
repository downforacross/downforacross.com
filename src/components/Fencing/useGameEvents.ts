import {useRef, useState} from 'react';
import HistoryWrapper from '../../lib/wrappers/HistoryWrapper';
import gameReducer from '../../shared/gameEvents/gameReducer';
import {GameEvent} from '../../shared/gameEvents/types/GameEvent';
import {GameState} from '../../shared/gameEvents/types/GameState';

export interface GameEventsHook {
  gameState: GameState;
  setEvents(gameEvents: GameEvent[]): void;
  addEvent(gameEvent: GameEvent): void;
  addOptimisticEvent(gameEvent: GameEvent): void;
}

const makeHistoryWrappper = (events: GameEvent[]): HistoryWrapper => {
  const res = new HistoryWrapper(events, gameReducer);
  if (!res.createEvent) {
    res.setCreateEvent({});
  }
  res.initializeMemo();
  return res;
};

export const useGameEvents = (): GameEventsHook => {
  const historyWrapperRef = useRef<HistoryWrapper>(makeHistoryWrappper([]));
  const [version, setVersion] = useState(0);
  return {
    gameState: historyWrapperRef.current.getSnapshot(),
    setEvents(events) {
      historyWrapperRef.current = makeHistoryWrappper(events);
      setVersion((version) => version + 1);
    },
    addEvent(event) {
      historyWrapperRef.current.addEvent(event);
      setVersion((version) => version + 1);
    },
    addOptimisticEvent(event) {
      historyWrapperRef.current.addOptimisticEvent(event);
      setVersion((version) => version + 1);
    },
  };
};
