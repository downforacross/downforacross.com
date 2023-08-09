import { islinkExpanderBot } from "./utils/link_preview_util"

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
    
    // crawled by link expander bot, so redirect to link preview endpoint for this game URL
    return new Response(null, { 
        status: 307,
        headers: {
            'Location': `https://api.foracross.com/api/link_preview?url=${url}` // vercel middleware can't really be tested in dev so just hardcoding to prod endpoint
        },
    })
}   