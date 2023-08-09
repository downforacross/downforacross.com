function isAsset(url) {
    return /\.(png|jpe?g|gif|css|js|svg|ico|map|json)$/i.test(url.pathname)
}

function isGameUrl(url) {
    const split = url.pathname.split('/')
    return split.length >= 3 && split[2] === 'game'
}

const linkExpanderUserAgents = [
    'Discordbot',
    'Slackbot-LinkExpanding'
]

function islinkExpanderBot(userAgent) {
    return linkExpanderUserAgents.some(ua => userAgent.includes(ua))
}

export default function middleware(req: Request) {
    const url = new URL(req.url)

    try {
        console.log(islinkExpanderBot(req.headers['user-agent']))
    } catch (error) {
        return new Response(error.toString(), {
            status: 501,
        })
    }

    // if (isAsset(url) || !isGameUrl(url) || !islinkExpanderBot(req.headers['user-agent'])) {
    if (isAsset(url) || !isGameUrl(url)) {
        return new Response(null, {
            headers: { 'x-middleware-next': '1' },
        })
    }

    // const oEmbedEndpoint = `${url.origin}'/api/oembed?url=${encodeURI(url.toString())}`
    // const linkHeaderContent = [
    //     `<${oEmbedEndpoint}>`,
    //     'rel="alternate"',
    //     'type="application/json+oembed"',
    //     'title="placeholder"'
    // ]

    // console.log(linkHeaderContent)

    // return new Response(null, {
    //     headers: {
    //         'x-middleware-next': '1',
    //         'Link': linkHeaderContent.join('; '),
    //     },
    // })

    return new Response(null, {
        status: 307,
        headers: {
            'Location': 'https://www.google.com', // Testing UA-based redirects
        },
    })
}   