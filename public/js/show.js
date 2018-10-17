async function showTokenPage() {

    //get issuance
    let issuance = await window.TokenRPC.getIssuance();

    document.getElementById('tokenpagetokenname').innerText = issuance.name;
    document.getElementById('tokenpagetokensymbol').innerText = issuance.symbol/* ? '(' + assetSymbol.slice(1) + ')' : ''*/;
    // if (assetIcon) document.getElementById('tokenpagetokenicon').src = assetIcon;

    document.getElementById('tokenpage').style.display = '';

    //
    //load token statistics
    let stats = await window.TokenRPC.getStats();
    let issuanceDate = new Date(stats.issuanceTimestamp * 1000);
    document.getElementById('tokenfirstissued').innerText = monthNames[issuanceDate.getMonth()] + ' ' + issuanceDate.getDate() + ', ' + issuanceDate.getFullYear();
    document.getElementById('tokentype').innerText = assetType;
    document.getElementById('tokencirculatingsupply').innerText = prettyNumber(stats.circulatingSupply);
    document.getElementById('tokentransactioncount').innerText = prettyNumber(stats.transactionCount);
    document.getElementById('statsprogress').style.display = 'none';
    document.getElementById('tokenstats').style.display = '';

    //
    //get balances for our addresses
    document.getElementById('balances').style.display = '';
    document.getElementById('balances').innerHTML = '';

    let fat0AddressTemplate = document.getElementById('fat0address');
    window.prefs.factoidAddresses.forEach(function (address) {

        let addressTemplate = fat0AddressTemplate.cloneNode(true);

        // document.getElementById('timestamp').innerText = '123';

        if (address.name) {
            addressTemplate.getElementsByClassName('name')[0].innerText = address.name;
            addressTemplate.getElementsByClassName('address')[0].innerText = '(' + address.fa + ')';
        } else {
            addressTemplate.getElementsByClassName('name')[0].innerText = address.fa;
        }

        // console.log(balances['FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM']);
        if (issuance.type === 'FAT-1') {
            addressTemplate.getElementsByClassName('amount')[0].innerText = ((balances[address.fa] ? prettyNumber(balances[address.fa].length) : 0)) + assetSymbol;
        } else if (issuance.type === 'FAT-0') {
            addressTemplate.getElementsByClassName('amount')[0].innerText = ((balances[address.fa] ? prettyNumber(balances[address.fa]) : 0)) + assetSymbol;
        }
        addressTemplate.getElementsByClassName('addresslink')[0].href = '/token/' + assetId + '/address/' + address.fa;

        if (prefs.addresses.indexOf(address) === 0) addressTemplate.style.marginBottom = '0px';

        document.getElementById('balances').appendChild(addressTemplate);
    });

    document.getElementById('balancesprogress').style.display = 'none';

    //
    //get latest token transactions & load
    let transactions = await window.TokenRPC.getTransactions();
    document.getElementById('transactions').style.display = '';
    document.getElementById('transactions').innerHTML = '';
    for (var i = transactions.length - 1; i >= 0; i--) {
        let tx = transactions[i];
        let template = getTransactionElement(tx);
        if (i === 0) template.style.marginBottom = '0px';

        document.getElementById('transactions').appendChild(template);
    }
    document.getElementById('transactionsprogress').style.display = 'none';
}

async function showAddressPage() {
    //get issuance
    let issuance = await window.TokenRPC.getIssuance();

    document.getElementById('addresspagetokenname').innerText = issuance.name;
    // if (assetIcon) document.getElementById('addresspagetokenicon').src = assetIcon;
    // else document.getElementById('addresspagetokenicon').src = 'https://explorer.factom.com/favicon.png';

    //set address
    document.getElementById('addresspageaddress').innerText = window.address;

    //then show panel
    document.getElementById('addresspage').style.display = '';

    //get balance & display based on token type
    let balance = await window.TokenRPC.getBalance(window.address);
    if (issuance.type === 'FAT-1') {
        document.getElementById('addresspagebalance').innerText = balance.length + '' + issuance.symbol;
        document.getElementById('addresssendtokenamount').disabled = true;
        document.getElementById('addresssendtokenamount').placeholder = 'Select Tokens Above';
        document.getElementById('fat1tokens').style.display = '';

        document.getElementById('fat1tokens').innerText = '';
        balance.forEach(function (tokenId) {
            let template = getFAT1TokenElement(tokenId);
            document.getElementById('fat1tokens').appendChild(template)
        });
    } else if (issuance.type === 'FAT-0') {
        document.getElementById('addresspagebalance').innerText = balance + '' + issuance.symbol;
        document.getElementById('addresssendtokenamount').disabled = false;
        document.getElementById('fat1tokens').style.display = 'none';
        document.getElementById('addresssendtokenamount').placeholder = 'Amount';
    }

    //check if the user owns this address
    if (window.prefs.factoidAddresses.find(function (address) {
        return address.fa === address
    })) { //show send token panel if so
        document.getElementById('addresssendtokens').style.display = '';
    } else {
        document.getElementById('addresssendtokens').style.display = 'none';
    }
    document.getElementById('addresstransactions').style.display = '';

    let addressTransactions = await window.TokenRPC.getTransactions(undefined, address);
    document.getElementById('addresstransactions').innerHTML = '';
    for (var i = addressTransactions.length - 1; i >= 0; i--) {
        let tx = addressTransactions[i];
        let template = getAddressTransactionElement(tx, address);
        if (i === 0) template.style.marginBottom = '0px';
        document.getElementById('addresstransactions').appendChild(template);
    }
    document.getElementById('addresstransactionsprogress').style.display = 'none';
}

function showAddTokenPage() {
    document.getElementById('addtokenbutton').className = 'tooltip a';
    document.getElementById('addtokenpage').style.display = '';
}

async function showTransactionPage() {

    //get issuance
    let issuance = await window.TokenRPC.getIssuance();

    document.getElementById('transactiontokenname').innerText = issuance.name;

    // if (assetIcon) document.getElementById('transactiontokenicon').src = assetIcon;

    //set address
    document.getElementById('transactionid').innerText = window.transactionHash;

    //then show panel
    document.getElementById('transactionpage').style.display = '';

    let transaction = await window.TokenRPC.getTransaction(window.transactionHash);
    // console.log(JSON.stringify(tx));

    document.getElementById('transactionid').innerText = transaction.entryHash;

    if (issuance.type === 'FAT-0') {
        document.getElementById('transactionamount').innerText = transaction.input.amount + issuance.symbol;
        document.getElementById('transactiontokenspanel').style.display = 'none';
    } else if (issuance.type === 'FAT-1') {
        document.getElementById('transactionamount').innerText = transaction.tokenIds.length + issuance.symbol;
        document.getElementById('transactiontokenspanel').style.display = '';
        document.getElementById('transactiontokenids').innerText = '';
        transaction.tokenIds.forEach(function (id) {
            let template = document.getElementById('tokenid').cloneNode(true);
            template.getElementsByClassName('tokenid')[0].innerText = id;
            template.getElementsByClassName('tokenid')[0].href = "?path=/token/" + window.assetId + "/token/" + id;
            document.getElementById('transactiontokenids').appendChild(template);
        })
    } else {
        throw new Error('no asset type!');
    }
    //handle coinbase too

    document.getElementById('transactionfrom').innerText = transaction.input.address;
    document.getElementById('transactionfromlink').href = '?path=/token/' + window.assetId + '/address/' + transaction.input.address;

    document.getElementById('transactionto').innerText = transaction.output.address;
    document.getElementById('transactiontolink').href = '?path=/token/' + window.assetId + '/address/' + transaction.output.address;

    let issuanceDate = new Date(transaction.timestamp * 1000);
    /*document.getElementById('transactiontimestamp').innerText =
        issuanceDate.toTimeString()*/

    document.getElementById('transactiontimestamp').innerText =
        monthNames[issuanceDate.getMonth()] + ' ' + issuanceDate.getDate() + ', ' + issuanceDate.getFullYear() + ' ' + (issuanceDate.getHours() < 10 ? '0' + issuanceDate.getHours() : issuanceDate.getHours()) + ':' + (issuanceDate.getMinutes() < 10 ? '0' + issuanceDate.getMinutes() : issuanceDate.getMinutes());

    if (transaction.input.address === 'FA1zT4aFpEvcnPqPCigB3fvGu4Q4mTXY22iiuV69DqE1pNhdF2MC') document.getElementById('transactioncoinbase').innerText = 'Yes';
    else document.getElementById('transactioncoinbase').innerText = 'No';

    /*
    document.getElementById('transactiontimestamp').innerText =
                issuanceDate.getMonth() + '/' + issuanceDate.getUTCDay() + '/' + (('' + issuanceDate.getFullYear()).slice(2)) + ' ' + issuanceDate.getHours() + ':' + issuanceDate.getMinutes();
    */

}

async function showIndividualTokenPage() {

    //get issuance
    let issuance = await window.TokenRPC.getIssuance();

    document.getElementById('individualtokeninfoname').innerText = issuance.name;
    document.getElementById('individualtokeninfotokenid').innerText = window.individualTokenId;

    // if (assetIcon) document.getElementById('individualtokeninfoicon').src = assetIcon;

    //set address
    // document.getElementById('transactionid').innerText = transactionHash;

    //then show panel
    document.getElementById('individualtokeninfopage').style.display = '';

    let token = await window.TokenRPC.getToken(window.individualTokenId);
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

}


//Utility Pages

function showSettingsPage() {
    document.getElementById('settingspage').style.display = '';
}

function showErrorPage(message) {
    document.getElementById('errortext').innerText = message;
    document.getElementById('errorpage').style.display = '';
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