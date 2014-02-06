var nilai           = (nilai === undefined) ? {} : nilai;
nilai.ext           = {};
nilai.ext.label_id  = 0;
nilai.ext.mark_id   = 0;
nilai.ext.tab_title = null;
nilai.ext.tab_url   = null;

nilai.ext.addCallback = function(obj)
{
    //nilai.ext.log(obj);
    if (obj.mark) {
        nilai.ext.showMessage('success', 'You have successfully added this page as a mark.');
        $('#edit-options').fadeIn('fast');
        nilai.ext.label_id = obj.mark.label_id;
        nilai.ext.mark_id  = obj.mark.mark_id;
        $('#submit').val('Edit Mark');
        $('h1').html('Edit Mark');
    }
    else {
        nilai.ext.updateError();
    }
};

nilai.ext.addMark = function()
{
    var query = 'label_id=' + nilai.urlEncode($('#label_id').val()) + '&notes=' + nilai.urlEncode($('#notes').val()) + '&url=' + nilai.urlEncode(nilai.ext.tab_url) + '&title=' + nilai.urlEncode(nilai.ext.tab_title);
    nilai.ajax(nilai.paths.add, query, 'POST', nilai.ext.addCallback, nilai.ext.updateError);
};

nilai.ext.archiveCallback = function(obj)
{
    //nilai.ext.log(obj);
    if (obj.mark) {
        $('#options').fadeOut('fast', function()
        {
            $('#archived').fadeIn('fast');
        });
    }
    else {
        nilai.ext.updateError();
    }
};

nilai.ext.archiveMark = function()
{
    nilai.ajax(nilai.paths.archive + '/' + nilai.ext.mark_id, '', 'POST', nilai.ext.archiveCallback, nilai.ext.updateError);
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

nilai.ext.deleteCallback = function(obj)
{
    //nilai.ext.log(obj);
    if (obj.mark) {
        $('#options').fadeOut('fast', function()
        {
            $('#deleted').fadeIn('fast');
        });
    }
    else {
        nilai.ext.updateError();
    }
};

nilai.ext.deleteMark = function()
{
    nilai.ajax(nilai.paths.delete + '/' + nilai.ext.mark_id, '', 'POST', nilai.ext.deleteCallback, nilai.ext.updateError);
};

nilai.ext.editCallback = function(obj)
{
    //nilai.ext.log(obj);
    if (obj.mark) {
        nilai.ext.showMessage('success', 'The mark was successfully updated.');
    }
    else {
        nilai.ext.updateError();
    }
};

nilai.ext.editMark = function()
{
    var query = 'label_id=' + nilai.urlEncode($('#label_id').val()) + '&notes=' + nilai.urlEncode($('#notes').val());
    nilai.ajax(nilai.paths.edit + '/' + nilai.ext.mark_id, query, 'POST', nilai.ext.editCallback, nilai.ext.updateError);
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
            nilai.ext.tab_url   = tab.url;
            nilai.ext.tab_title = tab.title;

            // Check if url was added already
            nilai.ajax(nilai.paths.check, 'url=' + nilai.urlEncode(tab.url), 'GET', nilai.ext.loadOptions, nilai.ext.loadOptions);
        }
    });
};

nilai.ext.loadOptions = function(obj)
{
    //nilai.ext.log(obj);
    // Set the defaults
    var action   = (obj.mark) ? 'edit' : 'add';
    var notes    = (obj.mark) ? obj.mark.notes : '';
    var button   = (obj.mark) ? 'Edit Mark' : 'Add Mark';
    var archived = (obj.mark) ? obj.mark.archived_on : '';

    // Set globally to be used in callback
    nilai.ext.label_id = (obj.mark) ? obj.mark.label_id : 0;

    // Set mark id
    nilai.ext.mark_id = (obj.mark) ? obj.mark.mark_id : '';

    // Set url and title
    nilai.ext.tab_url   = (obj.mark) ? obj.mark.url : nilai.ext.tab_url;
    nilai.ext.tab_title = (obj.mark) ? obj.mark.title : nilai.ext.tab_title;

    // Set the labels
    var labels   = localStorage.getItem('nilai_labels');
    (nilai.empty(labels)) ? nilai.ajax(nilai.paths.labels, '', 'GET', nilai.ext.setLabels, nilai.ext.setLabels) : nilai.ext.setLabels(JSON.parse(labels));

    // Set some defaults
    $('#text-url').html(nilai.ext.tab_url);
    $('#text-title').html(nilai.ext.tab_title);
    $('#notes').html(notes);
    $('#submit').val(button);
    $('h1').html(button);

    // If archived, show archive view
    // Else show add/edit view
    if (nilai.empty(archived) === false) {
        $('#archived').fadeIn('fast');
    }
    else {
        // Enabled edit only options
        if (action == 'edit') {
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
    //nilai.ext.log(obj);
    if (obj.mark) {
        $('#archived').fadeOut('fast', function()
        {
            $('#edit-options').show();
            $('#options').fadeIn('fast');
        });
    }
    else {
        nilai.ext.updateError();
    }
};

nilai.ext.restoreMark = function()
{
    nilai.ajax(nilai.paths.restore + '/' + nilai.ext.mark_id, '', 'POST', nilai.ext.restoreCallback, nilai.ext.updateError);
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

    //nilai.ext.log(obj);
};

nilai.ext.showMessage = function(type, msg)
{
    var color = (type == 'error') ? 'F2BBB8' : (type == 'success') ? '73D9B7' : 'F0F593';
    $('#message').css('background-color', '#' + color).html(msg).fadeIn('fast', function()
    {
        var timer = setTimeout(function()
        {
            $('#message').fadeOut('fast');
        }, 3500);
    });
};

nilai.ext.updateError = function()
{
    nilai.ext.showMessage('error', 'There was an issue completing the requested action. Please try again.');
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