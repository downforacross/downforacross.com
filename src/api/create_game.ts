// ========== GET /api/puzzlelist ============

// eslint-disable-next-line import/no-extraneous-dependencies
import qs from 'qs';
import {CreateGameRequest, CreateGameResponse} from '../shared/types';
import {SERVER_URL} from './constants';

export async function createGame(data: CreateGameRequest): Promise<CreateGameResponse> {
  const url = `${SERVER_URL}/api/game`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return await resp.json();
}
