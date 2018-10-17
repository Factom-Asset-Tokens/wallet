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