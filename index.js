const fs = require('fs');
const FAT0 = require('../fat/fat0/index');
const FAT1 = require('../fat/fat1/index');
const FATUtil = require('../fat/util');
const addressUtils = require('factom/src/addresses');


//need private FCT address for trading
//need Root chain ID and SK1 for issuance/coinbase

//homepage:
//left bar: Addresses
//left bar bottom left + add button / settings button
//main content: token info

//left bar tokens/add token/issue token

//right panel token page (all balances for each address)

//token stats:
/*
* Issuance date
* Max supply
* Circulating supply & %
* TX count
*
* */

//settings:
//root ID key + sk1

var FAT0tokenCaches = {};
var FAT1tokenCaches = {};

const flatCache = require('flat-cache');
// loads the cache, if one does not exists for the given
// Id a new one will be prepared to be created
const prefs = flatCache.load('prefs');

//set up defaults in disk cache
if (!prefs.getKey('addresses')) {
    prefs.setKey('addresses', [{
        fs: 'Fs1q7FHcW4Ti9tngdGAbA3CxMjhyXtNyB1BSdc8uR46jVUVCWtbJ',
        fa: 'FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM',
        name: 'Addr0'
    }]);
    prefs.save(true);
}

if (!prefs.getKey('tokens')) {
    prefs.setKey('tokens', [
        {
            id: 'fat0-test12',
            name: 'TestToken',
            symbol: 'TTK',
            type: 'FAT-0',
            icon: 'https://cmkt-image-prd.global.ssl.fastly.net/0.1.0/ps/2876528/300/200/m1/fpnw/wm0/y8prev1-.png?1498050434&s=8f7fb6c496c32a24b942c95e486e5a93'
        }
    ]);
    prefs.save(true);
}

if (!prefs.getKey('es')) {
    prefs.setKey('es', 'Es3k4L7La1g7CY5zVLer21H3JFkXgCBCBx8eSM2q9hLbevbuoL6a');
    prefs.save(true);
}

// console.log(JSON.stringify(prefs.all()));

const express = require('express');
const app = express();

//websockets
var appWs = require('express-ws')(app);

app.param('tokenid', function (req, res, next, tokenId) {
    req.tokenid = tokenId || 'tokenid';
    return next();
});

app.param('address', function (req, res, next, address) {
    req.address = address || 'address';
    return next();
});

app.use(express.static('public'));
app.listen(3000, () => console.log('Example app listening on port 3000!'))


app.get('/credentials', function (req, res) {
    let creds = {};
    creds.fs = prefs.getKey('fs') ? true : false;
    creds.rootChainId = prefs.getKey('rootChainId') ? true : false;
    creds.sk1 = prefs.getKey('sk1') ? true : false;
    res.send(JSON.stringify(creds))
});

app.post('/addresses', function (req, res) {
    let addresses = prefs.getKey('addresses');

    //get address type
    var address = req.query.address;
    var name = req.query.name;

    if (!address) {
        res.status(400).end();
        return;
    }
    if (!addressUtils.isValidFctPrivateAddress(address)) {
        res.status(400).end();
        return;
    }
    if (addresses.find(function (address) {
        return address.fs === address;
    })) {
        res.status(400).end();
        return;
    }

    addresses.push({fs: address, fa: addressUtils.getPublicAddress(address), name: name});
    prefs.setKey('addresses', addresses);
    prefs.save(true);

    res.status(200).end();
});

app.post('/tokens', async function (req, res) {
    let tokenId = req.query.tokenid;

    //check this token exists!
    let tokens = prefs.getKey('tokens');
    if (tokens.find(function (token) {
        return token.id === tokenId;
    })) {
        //token already exists
        res.status(200).end();
        return;
    }

    let fat = await getTokenCache(tokenId);
    fat.getIssuanceEntry().then(function (issuance) {
        console.log(issuance);

        let token = {
            id: tokenId,
            type: issuance.type,
            name: issuance.name,
            symbol: issuance.symbol,
        };

        tokens.push(token);
        prefs.setKey('tokens', tokens);
        prefs.save();

        res.send(JSON.stringify(token));
    }).catch(function (err) {
        res.status(200).end();
        return;
    });
});

app.get('/api/asset/:id', async function (req, res) {
    let id = req.params.id;
    try {
        let fat = await getTokenCache(id);

        let txAndBalances = await fat.getTransactionsAndBalances();
        // console.log(JSON.stringify(txAndBalances, undefined, 2));
        res.send(JSON.stringify(txAndBalances));

    } catch (err) {
        console.error(err);
        res.status(404).end();
        return;
    }
});


app.get('/api/asset/:id/token/:tokenid', async function (req, res) {
    let id = req.params.id;
    let tokenId = req.params.tokenid;
    try {
        let fat = await getTokenCache(id);
        if (fat.type !== 'FAT-1') {
            res.status(403).end();
            return
        }

        let token = await fat.getToken(tokenId);
        // console.log(JSON.stringify(txAndBalances, undefined, 2));
        res.send(JSON.stringify(token));

    } catch (err) {
        console.error(err);
        res.status(404).end();
        return;
    }
});

app.get('/api/asset/:id/address/:address', async function (req, res) {
    let id = req.params.id;
    let address = req.params.address;
    let fat = await getTokenCache(id);

    let txs = await fat.getTransactionsOfAddress(address)
    // console.log(JSON.stringify(txAndBalances));
    res.send(JSON.stringify(txs)).end();

});

app.get('/api/asset/:id/address/:address/balance', async function (req, res) {
    let id = req.params.id;
    let address = req.params.address;
    let fat = await getTokenCache(id);

    let balance = await fat.getBalance(address);
    // console.log(JSON.stringify(txAndBalances));
    res.send(JSON.stringify(balance)).end();
});

app.get('/api/asset/:id/stats', async function (req, res) {
    let id = req.params.id;
    let fat = await getTokenCache(id);

    let stats = await fat.getStats()
        // console.log(JSON.stringify(txAndBalances));
        res.send(JSON.stringify(stats)).end();
});

app.get('/api/asset/:id/transaction/:txid', async function (req, res) {
    let id = req.params.id;
    let fat = await getTokenCache(id);

    let tx = await fat.getTransaction(req.params.txid);
    // console.log(JSON.stringify(tx, undefined, 2));
    res.send(JSON.stringify(tx));

});

app.get('/prefs', function (req, res) {
    let prefs = flatCache.load('prefs').all();

    //sanitize private keys
    prefs.addresses.forEach(function (address) {
        address.fs = undefined;
    });

    res.send(JSON.stringify(prefs));
});


app.get('/api/asset/:id/address/:address/send', async function (req, res) {
    let tokenId = req.params.id;

    //if this token isn't tracked then 404
    if (!prefs.getKey('tokens').find(function (token) {
        return token.id === tokenId
    })) {
        res.status(404).end();
        return;
    }

    let from = req.params.address;
    let to = req.query.to;

    if (!from) {
        res.status(400).end();
        return;
    }

    if (!addressUtils.isValidFctPublicAddress(from)) {
        res.status(400).end();
        return;
    }

    //check we own this address
    let address = prefs.getKey('addresses').find(function (address) {
        return addressUtils.getPublicAddress(address.fs) === from;
    });

    if (!address) {
        res.status(403).end();
        return;
    }

    let fat = await getTokenCache(tokenId);

    if (fat.type === 'FAT-0') {

        //handle token amount
        let amount = req.query.amount;

        if (!amount || isNaN(parseFloat(amount)) || amount < 0) {
            res.status(400).end();
            return;
        }
        amount = parseFloat(amount);

        //attempt to send the tokens
        fat.transfer(address.fs, to, amount, prefs.getKey('es')).then(function (tx) {
            res.send(JSON.stringify(tx));
        }).catch(function (err) {
            console.error(err);
            res.status(500).send(JSON.stringify(err));
        })

    } else if (fat.type === 'FAT-1') {

        try {
            let tokenIds = req.query.ids;

            tokenIds = JSON.parse(tokenIds);
            if (!Array.isArray(tokenIds)) {
                res.status(403).send(JSON.stringify(err));
                return;
            }

            //attempt to transfer tokens
            //attempt to send the tokens
            fat.transfer(address.fs, to, tokenIds, prefs.getKey('es')).then(function (tx) {
                res.send(JSON.stringify(tx));
            }).catch(function (err) {
                console.error(err);
                res.status(500).send(JSON.stringify(err));
            })

        } catch (e) {
            console.error(e);
        }

    }





});

//Websockets
app.ws('/api/ws/token/:tokenid', function (ws, req) {
    ws.tokenid = req.tokenid;
    ws.on('message', function (msg) {
        console.log(msg);
    });
});

app.ws('/api/ws/token/:tokenid/address/:address', function (ws, req) {
    ws.tokenid = req.tokenid;
    ws.address = req.address;
    ws.on('message', function (msg) {
        console.log(msg);
    });
});

function dispatchTokenEvent(tokenId, event) {
    appWs.getWss('/api/ws/token/:tokenid').clients.forEach(function (client) {
        console.log('DISPATCHING TO CLIENTS')

        // console.log(client);
        // console.log(client.tokenid);
        if (client.tokenid == tokenId) client.send(JSON.stringify(event));
        else console.log('failedidcheck')
    });
}

function dispatchAddressEvent(tokenId, addresses, event) {
    if (event && event.event === 'TRANSACTION') {
        appWs.getWss('/api/ws/token/:tokenid/address/:address').clients.forEach(function (client) {
            if (client.tokenid == tokenId && addresses.includes(client.address)) client.send(JSON.stringify(event))
        });
    } else {
        console.error("MISSED DISPATCH")
    }
}


//UI/HTML route
app.get('/*', function (req, res) {
    res.send(fs.readFileSync('./public/index.html').toString()).end();
});


//Utils
async function getTokenCache(tokenId) {
    let cache = FAT0tokenCaches[tokenId];

    if (cache) {
        // console.log('Getting FAT0 cache for token ' + tokenId);
        return cache;
    }

    if (!cache) cache = FAT1tokenCaches[tokenId];

    if (cache) {
        // console.log('Getting FAT1 cache for token ' + tokenId);
        return cache;
    }

    //if doesn't exist then init the cache
    let type = await FATUtil.getTokenType(tokenId);
    if (type === 'FAT-0') {
        // console.log('Getting FAT0 cache for token ' + tokenId);
        return getFAT0Cache(tokenId)
    } else if (type === 'FAT-1') {
        // console.log('Getting FAT1 cache for token ' + tokenId);
        return getFAT1Cache(tokenId)
    } else {
        throw new Error('Unknown FAT type: ' + type);
    }
}

function getFAT0Cache(tokenId) {
    if (!FAT0tokenCaches[tokenId]) {
        let fat = new FAT0(tokenId);
        setCacheEventCallback(tokenId, fat);
        FAT0tokenCaches[tokenId] = fat;
        return fat;
    } else return FAT0tokenCaches[tokenId];
}

//Utils
function getFAT1Cache(tokenId) {
    if (!FAT1tokenCaches[tokenId]) {
        let fat = new FAT1(tokenId);
        setCacheEventCallback(tokenId, fat);
        FAT1tokenCaches[tokenId] = fat;
        return fat;
    } else return FAT0tokenCaches[tokenId];
}

function setCacheEventCallback(tokenId, cache) {
//temp since fat1 doesn't have tx events
    if (cache.on) cache.on('transaction', function (transaction) {

        dispatchTokenEvent(tokenId, {event: 'TRANSACTION', transaction: transaction});

        /*dispatchAddressEvent(tokenId, [transaction.input.address, transaction.output.address], {
            event: 'TRANSACTION',
            transaction: transaction
        });*/

        // if (transaction.input.address) dispatchAddressEvent(tokenId, transaction.input.address);
        // else if (transaction.output.address) dispatchAddressEvent(tokenId, transaction.output.address)
    });
}

//prime the cache
// getFAT0Cache('fat0-test12');