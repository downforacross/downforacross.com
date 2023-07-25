import express from 'express';
import _ from 'lodash'

import { InfoJson } from '../../src/shared/types';

import { getGameInfo } from '../model/game';

const router = express.Router();

router.get('/', async (req, res) => {
    console.log('got req', req.headers, req.body);
    let gameUrl;

    try {
        gameUrl = new URL(req.query.url as string);
    } catch (_) {
        res.sendStatus(400);
        return
    }

    const gid = gameUrl.pathname.split('/')[3]
    const info = await getGameInfo(gid) as InfoJson;

    if (_.isEmpty(info)) {
        res.sendStatus(400);
        return
    }

    // https://oembed.com/#section2.3
    res.json({
        type: 'link',
        version: '1.0',
        title: info.title
    });
});

export default router;
