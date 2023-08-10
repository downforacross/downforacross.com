const linkExpanderUserAgentSubstrings = {
    Discord: 'Discordbot',
    Slack: 'Slackbot-LinkExpanding',
    FB_Messenger: 'facebookexternalhit',
};

export function isFBMessengerCrawler(userAgent: string) {
    return userAgent.includes(linkExpanderUserAgentSubstrings.FB_Messenger)
}

export function islinkExpanderBot(userAgent: string) {
    return Object.values(linkExpanderUserAgentSubstrings).some(ua => userAgent.includes(ua))
}