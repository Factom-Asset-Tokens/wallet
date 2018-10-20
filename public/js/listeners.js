
function initListeners(){
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
        document.getElementById('addtokenpageaddbuttonlink').href = '?path=' + encodeURIComponent('/token/' + id);
        if (id.length > 0) document.getElementById('addtokenpageaddbutton').style.backgroundColor = 'green';
        else document.getElementById('addtokenpageaddbutton').style.backgroundColor = 'darkgrey'
    });


//    setup event layout close button
    document.getElementById('eventlayoutclose').onclick = function () {
        document.getElementById('eventlayout').style.display = 'none'
    };

    //setup prefs JSON file upload
    document.getElementById('fileSelect').onclick = function () {
        document.getElementById('fileElem').click();
    };
}

