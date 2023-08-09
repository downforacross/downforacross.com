const linkExpanderUserAgents = [
    'Discordbot',
    'Slackbot-LinkExpanding'
]

export function islinkExpanderBot(userAgent: string) {
    return linkExpanderUserAgents.some(ua => userAgent.includes(ua))
}