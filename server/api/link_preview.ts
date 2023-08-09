import express from 'express';
import _ from 'lodash'

import { InfoJson } from '../../src/shared/types';
import { getGameInfo } from '../model/game';
import { islinkExpanderBot } from "../../utils/link_preview_util"

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
        res.sendStatus(404);
        return
    }

    if (!islinkExpanderBot(req.headers['user-agent'] as string)) { // In case a human accesses this endpoint
        res.redirect(gameUrl.href)
        return
    }

    // OGP doesn't support an author property, so we need to delegate to the oEmbed endpoint
    const oembedEndpointUrl = `${req.protocol}://${req.get('host')}/api/oembed?author=${encodeURIComponent(info.author)}` 

    // https://ogp.me
    res.send(String.raw`
        <html prefix="og: https://ogp.me/ns/website#">
            <head>
                <title>${info.title}</title>
                <meta property="og:title" content="${info.title}" />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="${gameUrl.href}" />
                <meta property="og:description" content="${info.description}" />
                <meta property="og:site_name" content="downforacross.com" />
                <link type="application/json+oembed" href=${oembedEndpointUrl} />
                <meta name="theme-color" content="#6aa9f4">
            </head>
        </html>
    `)
});

export default router;
