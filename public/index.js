let assetId;
let address;
let transactionHash;
let individualTokenId;

//other token info
let asset;
let assetName = '';
let assetSymbol = '';
let assetIcon;
let assetType;
//

var prefs;

let sendAmountValid = false;
let sendAddressValid = false;

let selectedTokenIds = new Set();

setTimeout(function () {

    showEventLayout('Success sending transaction!', true)
}, 1000)


window.onload = function () {

    //parse the URL path
    var pathArray = window.location.pathname.split('/').slice(1);

    let showToken;
    let showAddress;
    let showTransaction;
    let showAddtoken;
    let showSettings;
    let showIndividualToken;
    if (pathArray[0] === 'token') {

        assetId = pathArray[1];
        if (!assetId) {
            alert('Must supply an Asset ID');
            return;
        }

        console.log('assetId: ' + assetId);

        //if the token we're looking at isn't in the tokens list then

        if (pathArray[2]) {

            if (pathArray[2] === 'address') {
                address = pathArray[3];
                if (!address) alert('Must supply an address');

                console.log('address: ' + pathArray[3]);

                showAddress = true;
            } else if (pathArray[2] === 'transactions') {
                transactionHash = pathArray[3];
                if (!transactionHash) alert('Must supply an transaction entryhash');

                console.log('txhash: ' + pathArray[3]);

                showTransaction = true;
            } else if (pathArray[2] === 'token') {
                individualTokenId = pathArray[3];
                if (!individualTokenId) alert('Must supply a tokenid');

                console.log('individual tokenid: ' + pathArray[3]);

                showIndividualToken = true;
            }
        } else {
            showToken = true;
        }
    } else if (pathArray[0] === 'addtoken') showAddtoken = true; else if (pathArray[0] === 'settings') showSettings = true;


    getPrefs(function (pref) {
        prefs = pref;

        //parse tokens
        console.log('PREF:');
        console.log(JSON.stringify(pref, undefined, 2));


        //redirect on root dir
        if (pathArray[0] === '') window.location.href = '../token/' + prefs.tokens[0].id;

        prefs.tokens.forEach(function (token) {
            let tokenIconTemplate = getTokenIconElement(token);
            //insert the template
            document.getElementById('tokenicons').insertBefore(tokenIconTemplate, document.getElementById('tokenicons').firstChild);
        });

        //if the token we're displaying doesn't exist in the cache, add it


        if (assetId) {
            let tokenExists = prefs.tokens.find(function (token) {
                return token.id === assetId;
            });
            if (!tokenExists) {
                //set display defaults

                assetName = assetId;
                assetName = assetName[0].toUpperCase() + assetName.slice(1);

                // console.log('TOKEN: '+JSON.stringify(token));
                // assetName = assetId;

                console.log('ADDINGTOKEN');
                //post to server
                addToken(assetId, function (err, tokenPref) {
                    console.log('ADDINGTOKENDONE: ' + err);
                    if (err) {
                        console.log('err: ' + err);
                        if (err == 404) {
                            console.log('404');
                            showErrorPage("Token " + assetId + ' not found');
                            return;
                        } else {
                            // console.log(err);
                        }
                        return;
                    }

                    // console.log(tokenPref);
                    // location.reload();
                    return;
                });


                //add simulated data temp
                prefs.tokens.push({
                    id: assetId,
                    name: assetId
                })
            } else {

                console.log('Displaying token: ' + JSON.stringify(tokenExists, undefined, 2));

                assetType = tokenExists.type
            }
        }

        //load the required page
        if (showToken) showTokenPage();
        else if (showAddress) showAddressPage();
        else if (showTransaction) showTransactionPage();
        else if (showAddtoken) showAddTokenPage();
        else if (showSettings) showSettingsPage();
        else if (showIndividualToken) showIndividualTokenPage()
    });

    //basic setup
    //setup send button

    $('#addresssendtokenamount').bind('input', function () {
        let amount = $(this).val();

        let amountStr = amount;
        amount = parseFloat(amount);

        if (amount < 0 || amountStr.length == 0) {
            document.getElementById('addresssendtokenamount').style.border = '1px solid red';
            sendAmountValid = false;
        } else {
            document.getElementById('addresssendtokenamount').style.border = '';
            sendAmountValid = true;
        }

        if (sendAddressValid && sendAmountValid) document.getElementById('addresssendtokenbutton').style.backgroundColor = 'green';
        else document.getElementById('addresssendtokenbutton').style.backgroundColor = 'darkgrey';
    });

    $('#addresssendtokenaddress').bind('input', function () {
        let fa = $(this).val(); // get the current value of the input field.

        if (!isValidFctPublicAddress(fa)) {
            document.getElementById('addresssendtokenaddress').style.border = '1px solid red';
            sendAddressValid = false;
        } else {
            document.getElementById('addresssendtokenaddress').style.border = '';
            sendAddressValid = true;
        }

        if (assetType === 'FAT-0') {
            if (sendAddressValid && sendAmountValid) document.getElementById('addresssendtokenbutton').style.backgroundColor = 'green';
            else document.getElementById('addresssendtokenbutton').style.backgroundColor = 'darkgrey';
        } else if (assetType === 'FAT-1') {
            if (sendAddressValid && selectedTokenIds.size > 0) document.getElementById('addresssendtokenbutton').style.backgroundColor = 'green';
            else document.getElementById('addresssendtokenbutton').style.backgroundColor = 'darkgrey';
        }

    });

    document.getElementById('addresssendtokenbutton').onclick = function () {
        if (!sendAddressValid) return; //not ready yet!

        if (assetType === 'FAT-1' && selectedTokenIds.size == 0) return;
        if (assetType === 'FAT-0' && sendAmountValid) return;

        let toAddress = document.getElementById('addresssendtokenaddress').value;
        let amount = parseFloat(document.getElementById('addresssendtokenamount').value);

        console.log('Sending ' + amount + ' tokens from ' + address + ' to ' + toAddress);

        //show send progress, disable inputs
        document.getElementById('addresssendtokenbutton').style.backgroundColor = 'darkgrey';
        document.getElementById('addresssendtokenbutton').style.color = 'darkgrey';
        document.getElementById('addresssendtokenbuttonprogress').style.display = '';

        document.getElementById('addresssendtokenamount').disabled = true;
        document.getElementById('addresssendtokenaddress').disabled = true;


        if (assetType === 'FAT-1') {
            sendFAT1Tokens(address, toAddress, selectedTokenIds, function (err, tx) {
                //show success floater

                document.getElementById('addresssendtokenbuttonprogress').style.display = 'none';
                document.getElementById('addresssendtokenbutton').style.color = 'white';

                document.getElementById('addresssendtokenamount').value = '';
                document.getElementById('addresssendtokenamount').disabled = false;

                document.getElementById('addresssendtokenaddress').value = '';
                document.getElementById('addresssendtokenaddress').disabled = false;
            });
            return;
        }

        sendFAT0Tokens(address, toAddress, amount, function (err, tx) {
            if (!err) alert("Success sent tokens!");
            document.getElementById('addresssendtokenbuttonprogress').style.display = 'none';
            document.getElementById('addresssendtokenbutton').style.color = 'white';

            document.getElementById('addresssendtokenamount').value = '';
            document.getElementById('addresssendtokenamount').disabled = false;

            document.getElementById('addresssendtokenaddress').value = '';
            document.getElementById('addresssendtokenaddress').disabled = false;
        });
    };


    //add token page
    /* document.getElementById('addtokenbutton').onclick = function () {
         hidePanels();
         document.getElementById('addtokenpage').style.display = '';
     };*/


    $('#addtokenpagetokenid').bind('input', function () {
        let id = document.getElementById('addtokenpagetokenid').value;
        document.getElementById('addtokenpageaddbuttonlink').href = '/token/' + id;
        if (id.length > 0) document.getElementById('addtokenpageaddbutton').style.backgroundColor = 'green'
        else document.getElementById('addtokenpageaddbutton').style.backgroundColor = 'darkgrey'
    });


//    setup event layout close button
    document.getElementById('eventlayoutclose').onclick = function () {
        document.getElementById('eventlayout').style.display = 'none'
    }


};


function sendFAT0Tokens(from, to, amount, callback) {
    $.get("/api/asset/" + assetId + "/address/" + from + '/send?amount=' + encodeURIComponent(amount) + '&to=' + encodeURIComponent(to), function (data, status) {

        if (status != 'success') {
            console.log(status);
            console.error(data);

            return;
        }

        let tx = JSON.parse(data);
        console.log(tx);
        callback(undefined, tx);

        alert('Success sending transaction!');
        showEventLayout('Success sending transaction!', true)
    });
}

function sendFAT1Tokens(from, to, ids, callback) {
    $.get("/api/asset/" + assetId + "/address/" + from + '/send?ids=' + encodeURIComponent(JSON.stringify(Array.from(selectedTokenIds))) + '&to=' + encodeURIComponent(to), function (data, status) {

        if (status != 'success') {
            console.log(status);
            console.error(data);
            return;
        }

        let tx = JSON.parse(data);
        console.log(tx);
        callback(undefined, tx);

        alert('Success sending transaction!');
        showEventLayout('Success sending transaction!', true);
    });
}

function showEventLayout(message, health) {
    if (health) document.getElementById('eventlayout').style.backgroundColor = 'green';
    else document.getElementById('eventlayout').style.backgroundColor = 'red';

    document.getElementById('eventtext').innerText = message;

    document.getElementById('eventlayout').style.display = '';

    setTimeout(function () {
        document.getElementById('eventlayout').style.display = 'none';
    }, 3000);
}

function isNumberKey(evt) {
    var charCode = (evt.which) ? evt.which : event.keyCode;
    if (charCode > 31 && (charCode != 46 && (charCode < 48 || charCode > 57)))
        return false;
    return true;
}

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

function getAddressTransactionElement(tx, address) {
    let txTemplate = document.getElementById('fat0tx').cloneNode(true);

    // document.getElementById('timestamp').innerText = '123';
    // document.getElementById('addresses').innerText = tx.input.address + ' ➡  ' + tx.output.address;
    txTemplate.getElementsByClassName('addresses')[0].innerText = tx.entryHash.slice(0, 32) + '...';
    txTemplate.getElementsByClassName('addresses')[0].href = '/token/' + assetId + '/transactions/' + tx.entryHash;

    let sign = '';

    if (tx.input.address === address) sign = '-';
    // else if (tx.input.address === address)

    // console.log('AT: ' + assetType)
    if (assetType === 'FAT-1') {
        txTemplate.getElementsByClassName('amount')[0].innerText = tx.tokenIds.length + assetSymbol;
    } else if (assetType === 'FAT-0') {
        txTemplate.getElementsByClassName('amount')[0].innerText = sign + tx.input.amount + assetSymbol;
    }

    return txTemplate.cloneNode(true);
}

function getFAT1TokenElement(id) {
    let txTemplate = document.getElementById('fat1token').cloneNode(true);

    // document.getElementById('timestamp').innerText = '123';
    // document.getElementById('addresses').innerText = tx.input.address + ' ➡  ' + tx.output.address;

    let check = txTemplate.getElementsByClassName('check')[0]
    check.onchange = function (element) {
        if (check.checked) selectedTokenIds.add(id);
        else selectedTokenIds.delete(id);

        if (selectedTokenIds.size > 0) {
            document.getElementById('addresssendtokenamount').placeholder = selectedTokenIds.size + ' Tokens';
        } else {
            document.getElementById('addresssendtokenamount').placeholder = 'Select Tokens Above';
        }

        if (selectedTokenIds.size > 0 && sendAddressValid) {
            document.getElementById('addresssendtokenbutton').style.backgroundColor = 'green';
        } else {
            document.getElementById('addresssendtokenbutton').style.backgroundColor = 'darkgrey';
        }
    };

    txTemplate.getElementsByClassName('id')[0].innerText = id;

    return txTemplate;
}

function getTokenIconElement(token) {
    let tokenIconTemplate = document.getElementById('tokenicon').cloneNode(true);

    // document.getElementById('timestamp').innerText = '123';
    // document.getElementById('addresses').innerText = tx.input.address + ' ➡  ' + tx.output.address;
    tokenIconTemplate.getElementsByClassName('name')[0].innerText = token.name ? token.name : token.id;

    if (token.icon) tokenIconTemplate.getElementsByClassName('image')[0].src = token.icon;
    else tokenIconTemplate.getElementsByClassName('image')[0].src = 'https://explorer.factom.com/favicon.png'

    tokenIconTemplate.getElementsByClassName('tokenlink')[0].href = '/token/' + token.id;

    tokenIconTemplate.className = 'tooltip';
    if (token.id === assetId) {
        asset = token;

        if (token.name) assetName = token.name;
        else assetName = token.id;

        if (token.symbol) assetSymbol = ' ' + token.symbol.toUpperCase();
        else token.symbol = '';

        if (token.icon) assetIcon = token.icon;

        //show selector wedge
        tokenIconTemplate.className = 'tooltip a';
    }

    return tokenIconTemplate;
}

function getTransactionElement(tx) {
    let txTemplate = document.getElementById('fat0tx').cloneNode(true);
    // console.log(JSON.stringify(tx, undefined, 2));
    // document.getElementById('timestamp').innerText = '123';
    // document.getElementById('addresses').innerText = tx.input.address + ' ➡  ' + tx.output.address;
    txTemplate.getElementsByClassName('addresses')[0].innerText = tx.entryHash.slice(0, 32) + '...';
    txTemplate.getElementsByClassName('addresses')[0].href = '/token/' + assetId + '/transactions/' + tx.entryHash;

    if (assetType === 'FAT-1') {
        txTemplate.getElementsByClassName('amount')[0].innerText = tx.tokenIds.length + assetSymbol;
    } else if (assetType === 'FAT-0') {
        txTemplate.getElementsByClassName('amount')[0].innerText = tx.input.amount + assetSymbol;
    }

    return txTemplate.cloneNode(true);
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

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"
];

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

function showErrorPage(message) {
    document.getElementById('errortext').innerText = message;
    document.getElementById('errorpage').style.display = '';
}

function showTokenPage() {
    hidePanels();

    console.log(assetName);
    console.log(assetIcon);
    document.getElementById('tokenpagetokenname').innerText = assetName;
    document.getElementById('tokenpagetokensymbol').innerText = assetSymbol ? '(' + assetSymbol.slice(1) + ')' : '';
    if (assetIcon) document.getElementById('tokenpagetokenicon').src = assetIcon;

    //refresh the data

    //listen for token level events
    var exampleSocket = new WebSocket("ws://" + window.location.hostname + ':' + window.location.port + '/api/ws/token/' + assetId);
    exampleSocket.onmessage = function (event) {
        // console.log(event.data);
        event = JSON.parse(event.data);
        switch (event.event) {
            case 'TRANSACTION': {
                let tx = event.transaction;
                let template = getTransactionElement(tx);

                document.getElementById('transactions').insertBefore(template, document.getElementById('transactions').childNodes[0]);

                break;
            }
        }
    };

    document.getElementById('tokenpage').style.display = '';

    reloadAssetPage(assetId);
}

function getPrefs(callback) {
    $.get("/prefs", function (data, status) {

        if (status != 'success') {
            console.log(status);
            console.error(data);
            return;
        }

        if (callback) callback(JSON.parse(data));
    });
}

function getIssuance(callback) {
    $.get("/api/asset/" + assetId, function (data, status) {

        if (status != 'success') {
            callback(data);
            return;
        }

        callback(undefined, JSON.parse(data));
    });
}


function getTransactions(callback) {
    $.get("/api/asset/" + assetId + "/transactions", function (data, status) {

        if (status != 'success') {
            callback(data);
            return;
        }

        callback(undefined, JSON.parse(data));
    });
}

function getTransaction(callback) {
    $.get("/api/asset/" + assetId + "/transactions/" + transactionHash, function (data, status) {
        if (status != 'success') {
            callback(data);
            return;
        }

        callback(undefined, JSON.parse(data));
    });
}

function getTransactionsOfAddress(callback) {
    $.get("/api/asset/" + assetId + "/address/" + address + '/transactions', function (data, status) {
        if (status != 'success') {
            callback(data);
            return;
        }

        callback(undefined, JSON.parse(data));
    });
}

function getBalances(callback) {
    $.get("/api/asset/" + assetId + "/balances", function (data, status) {

        if (status != 'success') {
            callback(data);
            return;
        }

        callback(undefined, JSON.parse(data));
    });
}

function getBalance(address, callback) {
    $.get("/api/asset/" + assetId + "/address/" + address + '/balance', function (data, status) {

        if (status != 'success') {
            callback(data);
            return;
        }

        callback(undefined, JSON.parse(data));
    });
}

function getToken(tokenId, callback) {
    $.get("/api/asset/" + assetId + "/token/" + tokenId, function (data, status) {

        if (status != 'success') {
            callback(data);
            return;
        }

        callback(undefined, JSON.parse(data));
    });
}

function getStats(callback) {
    $.get("/api/asset/" + assetId + "/stats", function (data, status) {

        if (status != 'success') {
            callback(data);
            return;
        }

        callback(undefined, JSON.parse(data));
    });
}

function showAddressPage() {
    hidePanels();

    //load values from prefs
    document.getElementById('addresspagetokenname').innerText = assetName;

    if (assetIcon) document.getElementById('addresspagetokenicon').src = assetIcon;
    else document.getElementById('addresspagetokenicon').src = 'https://explorer.factom.com/favicon.png';

    //set address
    document.getElementById('addresspageaddress').innerText = address;

    //then show panel
    document.getElementById('addresspage').style.display = '';

    var exampleSocket = new WebSocket("ws://" + window.location.hostname + ':' + window.location.port + '/api/ws/token/' + assetId);

    exampleSocket.onmessage = function (event) {

        event = JSON.parse(event.data);
        switch (event.event) {
            case 'TRANSACTION': {
                let tx = event.transaction;

                if (tx.input.address === address || tx.output.address === address) {
                    document.getElementById('addresstransactions').insertBefore(getTransactionElement(tx), document.getElementById('addresstransactions').childNodes[0]);
                } else {
                    console.log('Rejected TX!!!!');
                }


                break;
            }
        }
    };

    //load dynamic content
    reloadAddressPage(assetId, address);
}

function showAddTokenPage() {
    hidePanels();
    document.getElementById('addtokenbutton').className = 'tooltip a';
    document.getElementById('addtokenpage').style.display = '';
}

function showTransactionPage() {
    hidePanels();

    document.getElementById('transactiontokenname').innerText = assetName;

    if (assetIcon) document.getElementById('transactiontokenicon').src = assetIcon;

    //set address
    document.getElementById('transactionid').innerText = transactionHash;

    //then show panel
    document.getElementById('transactionpage').style.display = '';


    loadTransactionPage();
}

function showIndividualTokenPage() {
    hidePanels();

    document.getElementById('individualtokeninfoname').innerText = assetName;
    document.getElementById('individualtokeninfotokenid').innerText = individualTokenId;

    if (assetIcon) document.getElementById('individualtokeninfoicon').src = assetIcon;

    //set address
    // document.getElementById('transactionid').innerText = transactionHash;

    //then show panel
    document.getElementById('individualtokeninfopage').style.display = '';


    loadIndividualTokenPage();
}

function addToken(assetId, callback) {
    $.post("/tokens?tokenid=" + encodeURIComponent(assetId), function (data, status) {

        if (status != 'success') {
            callback(data);
            return;
        }

        callback(undefined, JSON.parse(data));
    });
}

function showSettingsPage() {
    hidePanels();

    document.getElementById('individualtokeninfoname').innerText = assetName;
    document.getElementById('individualtokeninfotokenid').innerText = individualTokenId;

    if (assetIcon) document.getElementById('individualtokeninfoicon').src = assetIcon;

    //set address
    // document.getElementById('transactionid').innerText = transactionHash;

    //then show panel
    document.getElementById('settingspage').style.display = '';


    loadIndividualTokenPage();
}