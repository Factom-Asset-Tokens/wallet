import {RPCBuilder} from './js/fat/fatjs.js';

let assetId;
let rootChainId;
let address;
let transactionHash;
let individualTokenId;

//other token info
let asset;
let assetName = '';
let assetSymbol = '';
let assetIcon;
let assetType;

//prefs template
var prefs;

let prefsTemplate = {
    factoidAddresses: [
        {
            name: '',
            fa: '',
            fs: ''
        }
    ],

    entryCreditAddresses: [
        {
            name: 'Courtesy Address',
            ec: '',
            es: ''
        }
    ],

    identities: [
        {
            rootChainId: '',
            sk1: '',
        }
    ],

    fatd: {
        host: 'localhost', //courtesy address eventually
        port: 8078
    },

    featuredTokens: [
        {
            tokenId: 'mytoken',
            rootChainId: ''
        }
    ]
};

let sendAmountValid = false;
let sendAddressValid = false;

let selectedTokenIds = new Set();


let FatdRPC;


window.onload = function () {

    //1. HANDLE WALLET CONFIG / FILE

    //if can't find prefs via webstorage
    if (!localStorage.getItem('prefs')) {
        //prompt user to upload if they have, continue with defaults for now

        prefs = prefsTemplate; //set defaults
        localStorage.setItem('prefs', JSON.stringify(prefs));
    } else {
        prefs = JSON.parse(localStorage.getItem('prefs'));
    }

    //setup RPC


    new RPCBuilder();

    //2. FROM FAT API: Get watched tokens list from fatd to show on left bar

    //add token icons to left nav bar
    /*tokens.forEach(function (token) {
        let tokenIconTemplate = getTokenIconElement(token);
        //insert the template
        document.getElementById('tokenicons').insertBefore(tokenIconTemplate, document.getElementById('tokenicons').firstChild);
    });*/

    //redirect to fatd token[0] on root path if available

    //otherwise use default init FAT token details (TBD, probably test token)

    //setup click listeners & others
    initListeners();

    //parse the URL path to determine what to show
    let urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.get('path')) window.location.href = '?path=/addtoken'; //if no route supplied redirect to addtoken page
    let pathArray = urlParams.get('path').split('/').slice(1);
    parsePath(pathArray);


    //Get token issuance from fatd to determine asset type (or from cache?)

    //load the required wallet page according to parsed path
    if (showToken) showTokenPage();
    else if (showAddress) showAddressPage();
    else if (showTransaction) showTransactionPage();
    else if (showAddtoken) showAddTokenPage();
    else if (showSettings) showSettingsPage();
    else if (showIndividualToken) showIndividualTokenPage();
    else showErrorPage("Unknown Path: \"" + pathArray + "\"")
};

function loadTransactions(txs) {

    document.getElementById('transactions').style.display = '';

    document.getElementById('transactions').innerHTML = '';

    //MAKE ASYNC!!
    for (var i = txs.length - 1; i >= 0; i--) {
        let tx = txs[i];
        let template = getTransactionElement(tx);
        if (i === 0) template.style.marginBottom = '0px';

        document.getElementById('transactions').appendChild(template);
    }
    document.getElementById('transactionsprogress').style.display = 'none';
}

function loadBalances(balances) {
    document.getElementById('balances').style.display = '';
    document.getElementById('balances').innerHTML = '';

    console.log(prefs);

    let fat0AddressTemplate = document.getElementById('fat0address');
    prefs.addresses.forEach(function (address) {

        let addressTemplate = fat0AddressTemplate.cloneNode(true);

        // document.getElementById('timestamp').innerText = '123';

        if (address.name) {
            addressTemplate.getElementsByClassName('name')[0].innerText = address.name;
            addressTemplate.getElementsByClassName('address')[0].innerText = '(' + address.fa + ')';
        } else {
            addressTemplate.getElementsByClassName('name')[0].innerText = address.fa;
        }

        // console.log(balances['FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM']);
        if (assetType === 'FAT-1') {
            addressTemplate.getElementsByClassName('amount')[0].innerText = ((balances[address.fa] ? prettyNumber(balances[address.fa].length) : 0)) + assetSymbol;
        } else if (assetType === 'FAT-0') {
            addressTemplate.getElementsByClassName('amount')[0].innerText = ((balances[address.fa] ? prettyNumber(balances[address.fa]) : 0)) + assetSymbol;
        }
        addressTemplate.getElementsByClassName('addresslink')[0].href = '/token/' + assetId + '/address/' + address.fa;

        if (prefs.addresses.indexOf(address) === 0) addressTemplate.style.marginBottom = '0px';

        document.getElementById('balances').appendChild(addressTemplate);
    });

    document.getElementById('balancesprogress').style.display = 'none';
}

function loadStats(stats) {
    // console.log(JSON.stringify(stats, undefined, 2));


    let issuanceDate = new Date(stats.issuanceTimestamp * 1000);


    document.getElementById('tokenfirstissued').innerText = monthNames[issuanceDate.getMonth()] + ' ' + issuanceDate.getDate() + ', ' + issuanceDate.getFullYear();
    document.getElementById('tokentype').innerText = assetType;


    // document.getElementById('tokensupply').innerText = prettyNumber(stats.totalSupply);
    document.getElementById('tokencirculatingsupply').innerText = prettyNumber(stats.circulatingSupply);
    document.getElementById('tokentransactioncount').innerText = prettyNumber(stats.transactionCount);

    document.getElementById('statsprogress').style.display = 'none';
    document.getElementById('tokenstats').style.display = '';
}

function reloadAssetPage(assetId) {
    getIssuance(function (err, issuance) {
        if (err) throw err;

        assetType = issuance.type;


        getBalances(function (err, balances) {
            if (err) throw err;

            getTransactions(function (err, transactions) {
                if (err) throw err;

                getStats(function (err, stats) {
                    if (err) throw err;
                    loadStats(stats);
                });

                reloadTokenPageStats(assetId);
                loadTransactions(transactions);
                loadBalances(balances);
            });
        });
    });
}

function reloadTokenPageStats(assetId) {
    $.get("/api/asset/" + assetId + "/stats", function (data, status) {

        if (status != 'success') {
            console.log(status);
            console.error(data);
            return;
        }

        let stats = JSON.parse(data);
        // console.log(JSON.stringify(stats));
        loadStats(stats);
    });
}

function reloadAddressPage(assetId, fa) {
    address = fa;
    getBalance(address, function (err, balance) {
        if (err) throw  err;
        getTransactionsOfAddress(function (err, transactions) {
            if (err) throw  err;
            loadAddressPage(transactions, balance);
        });
    });
}

function loadAddressPage(txs, balance) {

    if (assetType === 'FAT-1') {
        document.getElementById('addresspagebalance').innerText = balance.length + '' + assetSymbol;
        document.getElementById('addresssendtokenamount').disabled = true;
        document.getElementById('addresssendtokenamount').placeholder = 'Select Tokens Above';
        document.getElementById('fat1tokens').style.display = '';

        document.getElementById('fat1tokens').innerText = '';
        balance.forEach(function (tokenId) {
            let template = getFAT1TokenElement(tokenId);
            document.getElementById('fat1tokens').appendChild(template)
        });
    } else if (assetType === 'FAT-0') {
        document.getElementById('addresspagebalance').innerText = balance + '' + assetSymbol;
        document.getElementById('addresssendtokenamount').disabled = false;
        document.getElementById('fat1tokens').style.display = 'none';
        document.getElementById('addresssendtokenamount').placeholder = 'Amount';
    }

    //check if the user owns this address
    if (prefs.addresses.find(function (addr) {
        return addr.fa === address
    })) { //show send token panel
        document.getElementById('addresssendtokens').style.display = '';
    } else {
        document.getElementById('addresssendtokens').style.display = 'none';
    }

    document.getElementById('addresstransactions').style.display = '';

    document.getElementById('addresstransactions').innerHTML = '';
    for (var i = txs.length - 1; i >= 0; i--) {
        let tx = txs[i];
        let template = getAddressTransactionElement(tx, address);

        if (i === 0) template.style.marginBottom = '0px';

        document.getElementById('addresstransactions').appendChild(template);
    }
    document.getElementById('addresstransactionsprogress').style.display = 'none';
}

function loadTransactionPage() {
    $.get("/api/asset/" + assetId + "/transaction/" + transactionHash, function (data, status) {

        if (status != 'success') {
            // console.log(status);
            console.error(data);
            return;
        }

        let tx = JSON.parse(data);
        // console.log(JSON.stringify(tx));

        document.getElementById('transactionid').innerText = tx.entryHash;

        if (assetType === 'FAT-0') {
            document.getElementById('transactionamount').innerText = tx.input.amount + assetSymbol;
            document.getElementById('transactiontokenspanel').style.display = 'none';
        } else if (assetType === 'FAT-1') {
            document.getElementById('transactionamount').innerText = tx.tokenIds.length + assetSymbol;
            document.getElementById('transactiontokenspanel').style.display = '';
            document.getElementById('transactiontokenids').innerText = '';
            tx.tokenIds.forEach(function (id) {
                let template = document.getElementById('tokenid').cloneNode(true);
                template.getElementsByClassName('tokenid')[0].innerText = id;
                template.getElementsByClassName('tokenid')[0].href = "/token/" + assetId + "/token/" + id;
                document.getElementById('transactiontokenids').appendChild(template);
            })
        } else {
            throw new Error('no asset type!');
        }
        //handle coinbase too

        document.getElementById('transactionfrom').innerText = tx.input.address;
        document.getElementById('transactionfromlink').href = '/token/' + assetId + '/address/' + tx.input.address;

        document.getElementById('transactionto').innerText = tx.output.address;
        document.getElementById('transactiontolink').href = '/token/' + assetId + '/address/' + tx.output.address;

        let issuanceDate = new Date(tx.timestamp * 1000);
        /*document.getElementById('transactiontimestamp').innerText =
            issuanceDate.toTimeString()*/

        document.getElementById('transactiontimestamp').innerText =
            monthNames[issuanceDate.getMonth()] + ' ' + issuanceDate.getDate() + ', ' + issuanceDate.getFullYear() + ' ' + (issuanceDate.getHours() < 10 ? '0' + issuanceDate.getHours() : issuanceDate.getHours()) + ':' + (issuanceDate.getMinutes() < 10 ? '0' + issuanceDate.getMinutes() : issuanceDate.getMinutes());

        if (tx.input.address === 'FA1zT4aFpEvcnPqPCigB3fvGu4Q4mTXY22iiuV69DqE1pNhdF2MC') document.getElementById('transactioncoinbase').innerText = 'Yes';
        else document.getElementById('transactioncoinbase').innerText = 'No';

        /*
        document.getElementById('transactiontimestamp').innerText =
                    issuanceDate.getMonth() + '/' + issuanceDate.getUTCDay() + '/' + (('' + issuanceDate.getFullYear()).slice(2)) + ' ' + issuanceDate.getHours() + ':' + issuanceDate.getMinutes();
        */

    });
}

function loadIndividualTokenPage() {
    $.get("/api/asset/" + assetId + "/token/" + individualTokenId, function (data, status) {

        if (status != 'success') {
            // console.log(status);
            console.error(data);
            return;
        }

        let token = JSON.parse(data);
        // console.log(JSON.stringify(token));

        document.getElementById('individualtokeninfotransactioncount').innerText = token.transactions.length;

        document.getElementById('individualtokeninfotransactions').innerText = '';

        console.log('TXS: ' + token.transactions.length);
        token.transactions.forEach(function (tx) {
            let template = getTransactionElement(tx);
            document.getElementById('individualtokeninfotransactions').insertBefore(template, document.getElementById('individualtokeninfotransactions').firstChild);
        });

        let issuanceDate = new Date(token.timestamp * 1000);

        document.getElementById('individualtokeninfocurrentaddress').innerText = token.transactions[token.transactions.length - 1].output.address;
        document.getElementById('individualtokeninfocurrentaddress').href = '/token/' + assetId + '/address/' + token.transactions[token.transactions.length - 1].output.address;

        document.getElementById('individualtokeninfoussuancetimestamp').innerText =
            monthNames[issuanceDate.getMonth()] + ' ' + issuanceDate.getDate() + ', ' + issuanceDate.getFullYear() + ' ' + (issuanceDate.getHours() < 10 ? '0' + issuanceDate.getHours() : issuanceDate.getHours()) + ':' + (issuanceDate.getMinutes() < 10 ? '0' + issuanceDate.getMinutes() : issuanceDate.getMinutes());

    });
}

function hidePanels() {
    document.getElementById('tokenpage').style.display = 'none';
    document.getElementById('addresspage').style.display = 'none';
    document.getElementById('transactionpage').style.display = 'none';
    document.getElementById('transactionpage').style.display = 'none';
    document.getElementById('errorpage').style.display = 'none';
    document.getElementById('addtokenpage').style.display = 'none';
}

