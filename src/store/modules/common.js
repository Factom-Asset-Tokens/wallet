export function getIntegerPort(url) {
    if (url.port) {
        return parseInt(url.port);
    } else {
        return url.protocol === 'https:' ? 443 : 80;
    }
}