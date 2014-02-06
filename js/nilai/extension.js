var nilai           = (nilai === undefined) ? {} : nilai;
nilai.ext           = {};
nilai.ext.action    = 'add';
nilai.ext.label_id  = 0;
nilai.ext.mark_id   = 0;
nilai.ext.tab_title = null;
nilai.ext.tab_url   = null;

nilai.ext.addMark = function()
{
    nilai.ext.log('Add Mark');
};

nilai.ext.archiveMark = function()
{
    nilai.ext.log('Archive Mark');
};

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

nilai.ext.editMark = function()
{
    nilai.ext.log('Edit Mark');
};

nilai.ext.init = function(obj)
{
    chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT}, function(tab)
    {
        tab = tab[0] || tab;
        if (tab.url.indexOf('http') != 0) {
            $('#invalid').fadeIn('fast');
        }
        else {
            // Check if url was added already
            nilai.ajax(nilai.paths.check, 'url=' + nilai.urlEncode(tab.url), 'GET', nilai.ext.loadOptions, nilai.ext.loadOptions);
        }
    });
};

nilai.ext.loadOptions = function(obj)
{
    nilai.ext.log(obj);
    // Set the defaults
    var notes    = (obj.mark) ? obj.mark.notes : '';
    var button   = (obj.mark) ? 'Edit Mark' : 'Add Mark';
    var archived = (obj.mark) ? obj.mark.archived_on : '';

    // Set globally to be used in callback
    nilai.ext.label_id = (obj.mark) ? obj.mark.label_id : 0;

    // Set mark id
    nilai.ext.mark_id = (obj.mark) ? obj.mark.mark_id : '';

    // Set action
    nilai.ext.action  = (obj.mark) ? 'edit' : 'add';

    // Set url and title
    nilai.ext.tab_url   = (obj.mark) ? obj.mark.url : nilai.ext.tab_url;
    nilai.ext.tab_title = (obj.mark) ? obj.mark.title : nilai.ext.tab_title;

    // Set the labels
    var labels   = localStorage.getItem('nilai_labels');
    (nilai.empty(labels)) ? nilai.ajax(nilai.paths.labels, '', 'GET', nilai.ext.setLabels, nilai.ext.setLabels) : nilai.ext.setLabels(JSON.parse(labels));

    // Set some defaults
    $('#text-url').html(nilai.ext.tab_url);
    $('#text-title').html(nilai.ext.tab_title);
    $('#notes').text(notes);
    $('#submit').val(button);
    $('h1').html(button);

    // If archived, show archive view
    // Else show add/edit view
    if (nilai.empty(archived) === false) {
        $('#archived').fadeIn('fast');
    }
    else {
        // Enabled edit only options
        if (nilai.ext.action == 'edit') {
            $('#edit-options').show();
        }

        // Show the user the shiz
        $('#options').fadeIn('fast');
    }
};

nilai.ext.log = function(what)
{
    chrome.extension.getBackgroundPage().console.log(what);
};

nilai.ext.restoreCallback = function(obj)
{
    nilai.ext.log(obj);
    if (obj.mark) {
        if (nilai.empty(obj.mark.archived_on)) {
            $('#archived').slideUp('fast', function()
            {
                if (nilai.ext.action == 'edit') {
                    $('#edit-options').show();
                    $('#options').slideDown('fast');
                }
            });
        }
        else {
            nilai.ext.log('could not restore mark');
        }
    }
};

nilai.ext.restoreMark = function()
{
    nilai.ajax(nilai.paths.restore + '/' + nilai.ext.mark_id, '', 'POST', nilai.ext.restoreCallback, nilai.ext.restoreCallback);
};

nilai.ext.setLabels = function(obj)
{
    if (obj.labels) {
        var selected = '';
        for (var i in obj.labels) {
            selected = (obj.labels[i].label_id == nilai.ext.label_id) ? true : false;
            $('#label_id').append($('<option></option>').attr('value', obj.labels[i].label_id).attr('selected', selected).text(obj.labels[i].name));
        }
        localStorage.setItem('nilai_labels', JSON.stringify(obj));
    }

    nilai.ext.log(obj);
};

// Check the user is logged in
nilai.ajax(nilai.paths.ping, '', 'GET', nilai.ext.init, nilai.ext.auth);

// Trap buttons and links
$(document).ready(function()
{
    $('#submit').click(function(e)
    {
        e.preventDefault();
        var method = ($(this).val().indexOf('Add') >= 0) ? 'addMark' : 'editMark';
        nilai.ext[method]();
    });

    $('a[href="#"]').click(function(e)
    {
        e.preventDefault();
        var method = $(this).data('method');
        nilai.ext[method]();
    });
});