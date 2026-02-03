/*const blacklistedSockets = [
    "zelz",
    "atomportal.eu.org",
    "clever-teaching",
    "donutsmo.net",
    "kornineq.de",
    "hollow.network",
    "firemc."
];

if (typeof window !== 'undefined') {
    window.WebSocket = new Proxy(window.WebSocket, {
        construct(target, [url, protocols]) {
            if (blacklistedSockets.some(domain => url.includes(domain))) {
                return new target("ws://0.0.0.0:12345", protocols);
            }
            return new target(url, protocols);
        }
    });
};*/