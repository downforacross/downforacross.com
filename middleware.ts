function isAsset(url) {
    return /\.(png|jpe?g|gif|css|js|svg|ico|map|json)$/i.test(url.pathname)
}

export default function middleware(req: Request) {
    const url = new URL(req.url)

    if (isAsset(url)) {
        return new Response(null, {
            headers: { 'x-middleware-next': '1' },
        })
    }

    const headers = new Headers({ 'x-custom-1': 'value-1' })
    headers.set('x-custom-2', 'value-2')

    return new Response(null, {
        headers: {
            'x-middleware-next': '1',
            ...Object.fromEntries(headers),
        },
    })
}