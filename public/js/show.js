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