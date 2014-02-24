var unmark           = (unmark === undefined) ? {} : unmark;
unmark.ext           = {};
unmark.ext.label_id  = 0;
unmark.ext.mark_id   = 0;
unmark.ext.tab_title = null;
unmark.ext.tab_url   = null;

unmark.ext.addCallback = function(obj)
{
    //unmark.ext.log(obj);
    if (obj.mark) {
        unmark.ext.showMessage('success', 'You have successfully added this page as a mark.');
        $('#edit-options').fadeIn('fast');
        unmark.ext.label_id = obj.mark.label_id;
        unmark.ext.mark_id  = obj.mark.mark_id;
        $('#submit').val('Edit Mark');
        $('h1').html('Edit Mark');
    }
    else {
        unmark.ext.updateError();
    }
};

unmark.ext.addMark = function()
{
    var query = 'label_id=' + unmark.urlEncode($('#label_id').val()) + '&notes=' + unmark.urlEncode($('#notes').val()) + '&url=' + unmark.urlEncode(unmark.ext.tab_url) + '&title=' + unmark.urlEncode(unmark.ext.tab_title);
    unmark.ajax(unmark.paths.add, query, 'POST', unmark.ext.addCallback, unmark.ext.updateError);
};

unmark.ext.archiveCallback = function(obj)
{
    //unmark.ext.log(obj);
    if (obj.mark) {
        $('#options').fadeOut('fast', function()
        {
            $('#archived').fadeIn('fast');
        });
    }
    else {
        unmark.ext.updateError();
    }
};

unmark.ext.archiveMark = function()
{
    unmark.ajax(unmark.paths.archive + '/' + unmark.ext.mark_id, '', 'POST', unmark.ext.archiveCallback, unmark.ext.updateError);
};

unmark.ext.auth = function(obj)
{
    //unmark.ext.log(obj);
    if (obj.status == '403') {
        $('#login').fadeIn('fast');
    }
    else {
        $('#error').fadeIn('fast');
    }
};

unmark.ext.deleteCallback = function(obj)
{
    //unmark.ext.log(obj);
    if (obj.mark) {
        $('#options').fadeOut('fast', function()
        {
            $('#deleted').fadeIn('fast');
        });
    }
    else {
        unmark.ext.updateError();
    }
};

unmark.ext.deleteMark = function()
{
    unmark.ajax(unmark.paths.delete + '/' + unmark.ext.mark_id, '', 'POST', unmark.ext.deleteCallback, unmark.ext.updateError);
};

unmark.ext.editCallback = function(obj)
{
    //unmark.ext.log(obj);
    if (obj.mark) {
        unmark.ext.showMessage('success', 'The mark was successfully updated.');
    }
    else {
        unmark.ext.updateError();
    }
};

unmark.ext.editMark = function()
{
    var query = 'label_id=' + unmark.urlEncode($('#label_id').val()) + '&notes=' + unmark.urlEncode($('#notes').val());
    unmark.ajax(unmark.paths.edit + '/' + unmark.ext.mark_id, query, 'POST', unmark.ext.editCallback, unmark.ext.updateError);
};

unmark.ext.init = function(obj)
{
    chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT}, function(tab)
    {
        tab = tab[0] || tab;
        if (tab.url.indexOf('http') != 0) {
            $('#invalid').fadeIn('fast');
        }
        else {
            unmark.ext.tab_url   = tab.url;
            unmark.ext.tab_title = tab.title;

            // Check if url was added already
            unmark.ajax(unmark.paths.check, 'url=' + unmark.urlEncode(tab.url), 'GET', unmark.ext.loadOptions, unmark.ext.loadOptions);
        }
    });
};

unmark.ext.loadOptions = function(obj)
{
    //unmark.ext.log(obj);
    // Set the defaults
    var action   = (obj.mark) ? 'edit' : 'add';
    var notes    = (obj.mark) ? obj.mark.notes : '';
    var button   = (obj.mark) ? 'Edit Mark' : 'Add Mark';
    var archived = (obj.mark) ? obj.mark.archived_on : '';

    // Set globally to be used in callback
    unmark.ext.label_id = (obj.mark) ? obj.mark.label_id : 0;

    // Set mark id
    unmark.ext.mark_id = (obj.mark) ? obj.mark.mark_id : '';

    // Set url and title
    unmark.ext.tab_url   = (obj.mark) ? obj.mark.url : unmark.ext.tab_url;
    unmark.ext.tab_title = (obj.mark) ? obj.mark.title : unmark.ext.tab_title;

    // Set the labels
    var labels   = localStorage.getItem('unmark_labels');
    (unmark.empty(labels)) ? unmark.ajax(unmark.paths.labels, '', 'GET', unmark.ext.setLabels, unmark.ext.setLabels) : unmark.ext.setLabels(JSON.parse(labels));

    // Set some defaults
    $('#text-url').html(unmark.ext.tab_url);
    $('#text-title').html(unmark.ext.tab_title);
    $('#notes').html(notes);
    $('#submit').val(button);
    $('h1').html(button);

    // If archived, show archive view
    // Else show add/edit view
    if (unmark.empty(archived) === false) {
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

unmark.ext.log = function(what)
{
    chrome.extension.getBackgroundPage().console.log(what);
};

unmark.ext.login = function()
{
    window.open(unmark.host,'_newtab');
};

unmark.ext.restoreCallback = function(obj)
{
    //unmark.ext.log(obj);
    if (obj.mark) {
        $('#archived').fadeOut('fast', function()
        {
            $('#edit-options').show();
            $('#options').fadeIn('fast');
        });
    }
    else {
        unmark.ext.updateError();
    }
};

unmark.ext.restoreMark = function()
{
    unmark.ajax(unmark.paths.restore + '/' + unmark.ext.mark_id, '', 'POST', unmark.ext.restoreCallback, unmark.ext.updateError);
};

unmark.ext.setLabels = function(obj)
{
    if (obj.labels) {
        var selected = '';
        for (var i in obj.labels) {
            selected = (obj.labels[i].label_id == unmark.ext.label_id) ? true : false;
            $('#label_id').append($('<option></option>').attr('value', obj.labels[i].label_id).attr('selected', selected).text(obj.labels[i].name));
        }
        localStorage.setItem('unmark_labels', JSON.stringify(obj));
    }

    //unmark.ext.log(obj);
};

unmark.ext.showMessage = function(type, msg)
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

unmark.ext.updateError = function()
{
    unmark.ext.showMessage('error', 'There was an issue completing the requested action. Please try again.');
};

// Check the user is logged in
unmark.ajax(unmark.paths.ping, '', 'GET', unmark.ext.init, unmark.ext.auth);

// Trap buttons and links
$(document).ready(function()
{
    $('#submit').click(function(e)
    {
        e.preventDefault();
        var method = ($(this).val().indexOf('Add') >= 0) ? 'addMark' : 'editMark';
        unmark.ext[method]();
    });

    $('a[href="#"]').click(function(e)
    {
        e.preventDefault();
        var method = $(this).data('method');
        unmark.ext[method]();
    });
});