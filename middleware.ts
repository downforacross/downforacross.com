function isAsset(url) {
    return /\.(png|jpe?g|gif|css|js|svg|ico|map|json)$/i.test(url.pathname)
}

function isGameUrl(url) {
    const split = url.pathname.split('/')
    return split.length >= 3 && split[2] === 'game'
}

export default function middleware(req: Request) {
    const url = new URL(req.url)

    if (isAsset(url) || !isGameUrl(url)) {
        return new Response(null, {
            headers: { 'x-middleware-next': '1' },
        })
    }

    const oEmbedEndpoint = `${url.origin}'/api/oembed?url=${encodeURI(url.toString())}`
    const linkHeaderContent = [
        `<${oEmbedEndpoint}>`,
        'rel="alternate"',
        'type="application/json+oembed"',
        'title="placeholder"'
    ]

    console.log(linkHeaderContent)

    return new Response(null, {
        headers: {
            'x-middleware-next': '1',
            'Link': linkHeaderContent.join('; '),
        },
    })
}