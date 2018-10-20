const RPCBuilder = fatjs.RPCBuilder;

//prefs template
let prefsTemplate = {
    factoidAddresses: [
        {
            name: 'Test Address',
            fa: 'FA1zT4aFpEvcnPqPCigB3fvGu4Q4mTXY22iiuV69DqE1pNhdF2MC', //FAT Coinbase Address
            fs: 'Fs1KWJrpLdfucvmYwN2nWrwepLn8ercpMbzXshd1g8zyhKXLVLWj'
        }
    ],

    entryCreditAddresses: [
        {
            name: 'Courtesy Address', //courtesy EC address eventually
            ec: '',
            es: ''
        }
    ],

    identities: [
        {
            name: 'Test Identity',
            rootChainId: '',
            sk1: '',
        }
    ],

    fatd: {
        host: 'localhost', //courtesy daemon address eventually
        port: 8078
    },

    featuredTokens: [
        {
            tokenId: 'testtoken',
            rootChainId: '888888b2e7c7c63655fa85e0b0c43b4b036a6bede51d38964426f122f61c5584'
        }
    ]
};

let sendAmountValid = false;
let sendAddressValid = false;

let selectedTokenIds = new Set();

window.onload = function () {
    //parse the URL path to determine what to show
    let urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.get('path')) window.location.href = '?path=/addtoken'; //if no route supplied redirect to addtoken page
    let pathArray = urlParams.get('path').split('/').slice(1);
    parsePath(pathArray);

    //1. Handle wallet config / config file
    if (!localStorage.getItem('prefs')) {
        //if we can't find prefs via WebStorage prompt user to upload if they have it, and continue with defaults for now
        window.prefs = prefsTemplate; //set defaults
        localStorage.setItem('prefs', JSON.stringify(prefsTemplate));
    } else {
        window.prefs = JSON.parse(localStorage.getItem('prefs')); //otherwise load from storage
    }

    console.log(JSON.stringify(window.prefs, undefined, 2));

    //setup RPC from prefs
    window.RPC = new RPCBuilder()
        .host(window.prefs.fatd.host)
        .port(window.prefs.fatd.port)
        .build();

    //if this is a token page, set up the Token's RPC
    if (window.assetId && window.rootChainId) {
        window.TokenRPC = window.RPC.getTokenRPC(window.assetId, window.rootChainId);
    }

    //2. FROM FAT API: Get watched tokens list from fatd to show on left bar
    /*window.RPC.getTrackedTokens().then(function (tokens) {

    }).catch(console.error);*/

    //add token icons to left nav bar:
    let tokens = [ //MOCK FOR NOW
        {
            id: 'coffeecoin',
            rootChainId: '888888d027c59579fc47a6fc6c4a5c0409c7c39bc38a86cb5fc0069978493762',
            name: 'CoffeeCoin',
            symbol: 'CCN',
            icon: 'https://png.icons8.com/color/80/5ECCDD/java-coffee-bean-logo.png'
        }
    ];

    tokens.forEach(function (token) {
        let tokenIconTemplate = getTokenIconElement(token);
        //insert the template into the bar
        document.getElementById('tokenicons').insertBefore(tokenIconTemplate, document.getElementById('tokenicons').firstChild);
    });

    //setup click listeners & others
    initListeners();

    //load the required wallet page according to parsed path
    if (showToken) showTokenPage();
    else if (showAddress) showAddressPage();
    else if (showTransaction) showTransactionPage();
    else if (showAddtoken) showAddTokenPage();
    else if (showSettings) showSettingsPage();
    else if (showIndividualToken) showIndividualTokenPage();
    else showErrorPage("Unknown Path: \"" + pathArray + "\"")
};

let showToken;
let showAddress;
let showTransaction;
let showAddtoken;
let showSettings;
let showIndividualToken;

function parsePath(pathArray) {
    console.log(pathArray);

    if (pathArray[0] === 'token') {

        if (!pathArray[1]) {
            showErrorPage('No TokenID Supplied');
            return;
        }
        window.assetId = pathArray[1];


        console.log('assetId: ' + window.assetId);

        if (!pathArray[2]) {
            showErrorPage('No Issuer Root Chain ID Supplied');
            return;
        }
        //check if valid root chain ID
        window.rootChainId = pathArray[2];

        console.log('rootChainId: ' + window.rootChainId);
        //if the token we're looking at isn't in the tokens list then

        if (pathArray[3]) {

            if (pathArray[3] === 'address') {

                if (!pathArray[4]) {
                    showErrorPage('No Address Was Supplied');
                    return;
                }
                window.address = pathArray[4];

                console.log('address: ' + pathArray[4]);

                showAddress = true;
            } else if (pathArray[3] === 'transactions') {
                if (!pathArray[4]) {
                    showErrorPage('No Transaction ID Supplied');
                    return;
                }
                window.transactionHash = pathArray[4];

                console.log('txhash: ' + pathArray[4]);

                showTransaction = true;
            } else if (pathArray[3] === 'token') {
                if (!pathArray[4]) {
                    showErrorPage('No Non-Fungible Token ID Supplied');
                    return;
                }
                window.individualTokenId = pathArray[4];

                console.log('individual tokenid: ' + pathArray[4]);

                showIndividualToken = true;
            }
        } else {
            showToken = true;
        }
    } else if (pathArray[0] === 'addtoken') showAddtoken = true; else if (pathArray[0] === 'settings') showSettings = true;

}


