import { islinkExpanderBot } from "./utils/link_preview_util"
import { SERVER_URL } from "./src/api/constants"

function isAsset(url) {
    return /\.(png|jpe?g|gif|css|js|svg|ico|map|json)$/i.test(url.pathname)
}

function isGameUrl(url) {
    const split = url.pathname.split('/')
    return split.length >= 3 && split[2] === 'game'
}

export default function middleware(req: Request) {
    const url = new URL(req.url)

    if (isAsset(url) || !isGameUrl(url) || !islinkExpanderBot(req.headers.get('user-agent') as string)) {
        return new Response(null, {
            headers: { 'x-middleware-next': '1' },
        })
    }

    return new Response(SERVER_URL, {
        // status: 307,
        // headers: {
        //     'Location': `https://www.google.com?url=${url}`, // temp url for testing, needs to be replaced by api.foracross.com
        // },
    })
}   