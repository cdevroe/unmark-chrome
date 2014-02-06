var nilai           = (nilai === undefined) ? {} : nilai;
nilai.ext           = {};
nilai.ext.tab_title = null;
nilai.ext.tab_url   = null;

nilai.ext.auth = function(obj)
{
    //nilai.ext.log(obj);
    if (obj.status == '403') {
        $('#login').fadeIn('fast');
    }
    else {
        $('#error').fadeIn('fast');
    }
};

nilai.ext.init = function(obj) {
    $('#options').fadeIn('fast');
    chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT}, function(tab)
    {
        tab                 = tab[0] || tab;
        nilai.ext.tab_url   = tab.url;
        nilai.ext.tab_title = tab.title;
        var labels          = localStorage.getItem('nilai_labels');

        if (nilai.empty(labels)) {
            nilai.ajax(nilai.paths.labels, '', 'GET', nilai.ext.labelSuccess, nilai.ext.labelError);
        }
        else {
            nilai.ext.labelSuccess(JSON.parse(labels));
        }

        $('#nilai_url').html(tab.url);
        $('#nilai_title').html(tab.title);
    });
};

nilai.ext.labelError = function(obj)
{
    var status = obj.status || -1;
    var err    = (status == '403') ? 'Please log into your account first and then try again.' : obj.err;
    status     = (status > 0) ? ' (' + status + ')' : '';
    //nilai.context.pushMessage('error', err + status);
};

nilai.ext.labelSuccess = function(obj)
{
    if (obj.labels) {
        for (var i in obj.labels) {
            $('#nilai_label_id').append($('<option></option>').attr('value', obj.labels[i].label_id).text(obj.labels[i].name));
        }
    }
    localStorage.setItem('nilai_labels', JSON.stringify(obj));
    nilai.ext.log(obj);
};

nilai.ext.log = function(what)
{
    chrome.extension.getBackgroundPage().console.log(what);
};

// Check the user is logged in
nilai.ajax(nilai.paths.ping, '', 'GET', nilai.ext.init, nilai.ext.auth);