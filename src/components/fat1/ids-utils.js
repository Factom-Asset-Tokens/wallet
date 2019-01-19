export function displayIds(value) {
    if (value.from == value.to) {
        return value.from.toLocaleString();
    } else {
        return `${value.from.toLocaleString()} to ${value.to.toLocaleString()}`;
    }
}

export function sortIds(ids) {
    return ids.slice().sort((a, b) => a.from > b.from);
}

export function availableTokens(allTokensList, selectedTokensList) {

    const availableTokens = {};
    const selectedTokens = {};
    selectedTokensList.forEach(s => selectedTokens[computeId(s)] = { ...s });

    // Handle case of exact match
    for (const t of allTokensList) {
        const id = computeId(t);
        if (selectedTokens[id]) {
            delete selectedTokens[id];
        } else {
            availableTokens[id] = { ...t };
        }
    }

    // Handle remaining cases of sub-ranges
    outer:
    for (const st of Object.values(selectedTokens)) {
        for (const id in availableTokens) {
            const r = availableTokens[id];
            if (isInRange(st, r)) {
                delete availableTokens[id];
                const split = rangeSubstract(r, st);
                split.forEach(s => availableTokens[computeId(s)] = s);

                continue outer;
            }
        }
        throw new Error(`Illegal state: ${JSON.stringify(st)} not found in ${JSON.stringify(availableTokens)}`);
    }

    return sortIds(Object.values(availableTokens));
}

function computeId(e) {
    return `${e.from}-${e.to}`;
}

function isInRange(element, range) {
    return range.from <= element.from && element.to <= range.to;
}

function rangeSubstract(range, sub) {
    if (sub.from === range.from && sub.to === range.to) {
        return [];
    } else if (sub.from === range.from) {
        return [createRange(sub.to + 1, range.to)];
    } else if (sub.to === range.to) {
        return [createRange(range.from, sub.from - 1)];
    } else {
        return [createRange(range.from, sub.from - 1), createRange(sub.to + 1, range.to)];
    }
}

function createRange(from, to) {
    return {
        from, to
    }
}