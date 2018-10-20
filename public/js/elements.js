function getAddressTransactionElement(assetType, assetSymbol, tx, address) {
    let txTemplate = document.getElementById('fat0tx').cloneNode(true);

    // document.getElementById('timestamp').innerText = '123';
    // document.getElementById('addresses').innerText = tx.input.address + ' ➡  ' + tx.output.address;
    txTemplate.getElementsByClassName('addresses')[0].innerText = tx.id.slice(0, 32) + '...';
    txTemplate.getElementsByClassName('addresses')[0].href = '?path=/token/' + window.assetId + '/' + window.rootChainId + '/transactions/' + tx.id;

    let sign = '';

    if (tx.inputs.find(input => input.address === address) && !tx.outputs.find(input => input.address === address)) sign = '-';
    // else if (tx.input.address === address)

    // console.log('AT: ' + assetType)
    if (assetType === 'FAT-1') {
        txTemplate.getElementsByClassName('amount')[0].innerText = tx.tokenIds.length + assetSymbol;
    } else if (assetType === 'FAT-0') {
        const totalAmount = tx.inputs.reduce(function (sum, input) {
            return sum + input.amount
        }, 0);

        txTemplate.getElementsByClassName('amount')[0].innerText = sign + totalAmount + ' ' + assetSymbol;
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
    else tokenIconTemplate.getElementsByClassName('image')[0].src = 'https://explorer.factom.com/favicon.png';

    tokenIconTemplate.getElementsByClassName('tokenlink')[0].href = '?path=/token/' + token.id + '/' + token.rootChainId;

    tokenIconTemplate.className = 'tooltip';
    if (token.id === window.assetId) {
        window.asset = token;

        if (token.name) window.assetName = token.name;
        else window.assetName = token.id;

        if (token.symbol) window.assetSymbol = ' ' + token.symbol.toUpperCase();
        else token.symbol = '';

        if (token.icon) window.assetIcon = token.icon;

        //show selector wedge
        tokenIconTemplate.className = 'tooltip a';
    }

    return tokenIconTemplate;
}

function getFAT0TransactionElement(assetSymbol, tx) {
    let txTemplate = document.getElementById('fat0tx').cloneNode(true);
    // console.log(JSON.stringify(tx, undefined, 2));
    // document.getElementById('timestamp').innerText = '123';
    // document.getElementById('addresses').innerText = tx.input.address + ' ➡  ' + tx.output.address;
    txTemplate.getElementsByClassName('addresses')[0].innerText = tx.id.slice(0, 32) + '...';
    txTemplate.getElementsByClassName('addresses')[0].href = '?path=/token/' + window.assetId + '/' + window.rootChainId + '/transactions/' + tx.id;
    const totalAmount = tx.inputs.reduce(function (sum, input) {
        return sum + input.amount
    }, 0);
    txTemplate.getElementsByClassName('amount')[0].innerText = totalAmount + ' ' + assetSymbol;

    console.log('AAA');
    return txTemplate.cloneNode(true);

}

function getFAT0InputElement(symbol, input) {
    let inputTemplate = document.getElementById('inputtemplate').cloneNode(true);
    // console.log(JSON.stringify(tx, undefined, 2));
    // document.getElementById('timestamp').innerText = '123';
    // document.getElementById('addresses').innerText = tx.input.address + ' ➡  ' + tx.output.address;
    inputTemplate.getElementsByClassName('inputaddress')[0].innerText = input.address;
    inputTemplate.getElementsByClassName('inputaddress')[0].href = '?path=/token/' + window.assetId + '/' + window.rootChainId + '/address/' + input.address;
    inputTemplate.getElementsByClassName('inputamount')[0].innerText = input.amount + ' ' + symbol;

    return inputTemplate.cloneNode(true);
}

function getSettingsAddressElement(address) {
    let addressTemplate = document.getElementById('settingsaddresstemplate').cloneNode(true);
    addressTemplate.getElementsByClassName('addressname')[0].innerText = address.name;
    addressTemplate.getElementsByClassName('address')[0].innerText = address.fa;
    addressTemplate.getElementsByClassName('close')[0].onclick = function () {
        for (let i = 0; i < window.prefs.factoidAddresses.length; i++) {
            let addr = window.prefs.factoidAddresses[i];
            if (addr.fa === address.fa) window.prefs.factoidAddresses.splice(i, 1)
        }
        localStorage.setItem('prefs', JSON.stringify(window.prefs));
        location.reload(true);
    };
    return addressTemplate;
}