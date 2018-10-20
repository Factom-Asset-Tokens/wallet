const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"
];

function prettyNumber(num, opts) {
    var defaultOpts = {
        short: true,
        lowerCase: false,
        addCommas: true,
        round: 2
    };

    if (typeof num != "number") {
        return "";
    }

    function round(num, dec) {
        num = num * Math.pow(10, dec);

        num = Math.round(num);

        num /= Math.pow(10, dec);

        return num;
    }

    if (typeof opts == 'undefined') {
        opts = {};
    }

    for (var i in defaultOpts) {
        opts[i] = (typeof opts[i] != 'undefined') ? opts[i] : defaultOpts[i];
    }

    if (opts.short) {
        var decimal_places = Math.floor(Math.log(num) / Math.log(10));

        var dec = [{
            'suffix': 'T',
            'divisor': 12
        }, {
            'suffix': 'B',
            'divisor': 9
        }, {
            'suffix': 'M',
            'divisor': 6
        }, {
            'suffix': 'K',
            'divisor': 3
        }, {
            'suffix': '',
            'divisor': 0
        }];

        for (var i in dec) {
            if (decimal_places > dec[i].divisor) {
                num = round((num / Math.pow(10, dec[i].divisor)), 2 - (decimal_places - dec[i].divisor));

                if (num >= 1000 && i > 0) {
                    decimal_places -= 3;
                    num = round(num / 1000, 2 - (decimal_places - dec[i - 1].divisor));
                    num += dec[i - 1].suffix;
                }
                else {
                    num += dec[i].suffix;
                }

                break;
            }
        }
        num = '' + num;
        if (opts.lowerCase) {
            num = num.toLowerCase();
        }
    }
    else if (opts.addCommas) {
        var decnum = ('' + (round(num, opts.round) - Math.floor(num))).substr(2);
        var tempnum = '' + Math.floor(num);
        num = '';
        for (i = tempnum.length - 1, j = 0; i >= 0; i--, j++) {
            if (j > 0 && j % 3 == 0) {
                num = ',' + num;
            }
            num = tempnum[i] + num;
        }

        if (decnum > 0) {
            num = num + '.' + decnum;
        }
    }
    return num;
}

function isNumberKey(evt) {
    let charCode = (evt.which) ? evt.which : event.keyCode;
    return !(charCode > 31 && (charCode !== 46 && (charCode < 48 || charCode > 57)));
}

//we need better validation here!
function isValidFctPublicAddress(address) {
    return address.length == 52 && address.substring(0, 2) === 'FA';
}

function downloadObjectAsJson(exportObj, exportName) {
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function prefsUpload(files) {
    // var fileList = this.files;
    /* now you can work with the file list */

    let reader = new FileReader();
    reader.onload = function (event) {
        let prefs;
        try {
            prefs = JSON.parse(event.target.result);
        } catch (e) {
            console.error(e);
            showErrorPage("Invalid Preferences JSON");
            return;
        }

        //evaluate prefs validity:

        if (prefs.factoidAddresses && !prefs.factoidAddresses.every(address => {
            return true;
        })) throw new Error("Invalid Factoid Address");

        if (prefs.identities && !prefs.identities.every(identity => {
            return true;
        })) throw new Error("Invalid Identity");

        if (prefs.entryCreditAddresses && !prefs.entryCreditAddresses.every(address => {
            return true;
        })) throw new Error("Invalid Entry Credit Address");

        if (prefs.fatd) {

        }

        window.prefs = prefs;
        //cache in localStorage
    };
    reader.readAsText(files[0].slice(0));
}