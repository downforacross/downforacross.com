import {EventDef} from '../types/EventDef';

export interface SendChatMessageEvent {
  id: string;
  message: string;
}

const updateDisplayName: EventDef<SendChatMessageEvent> = {
  reducer(state, {id, message}, timestamp) {
    return {
      ...state,
      chat: {
        messages: [
          ...state.chat.messages,
          {
            text: message,
            senderId: id,
            timestamp,
          },
        ],
      },
    };
  },
};

export default updateDisplayName;
