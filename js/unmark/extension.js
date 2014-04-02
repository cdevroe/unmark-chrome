var unmark           = (unmark === undefined) ? {} : unmark;
unmark.ext           = {};
unmark.ext.label_id  = 0;
unmark.ext.mark_id   = 0;
unmark.ext.notes     = 'Type note text here...';
unmark.ext.tab_title = null;
unmark.ext.tab_url   = null;

unmark.ext.mark_info = {
    'title'    : unmark.ext.tab_title,
    'url'      : unmark.ext.tab_url,
    'label_id' : unmark.ext.label_id,
    'mark_id'  : unmark.ext.mark_id,
    'notes'    : ''
};

unmark.ext.addCallback = function(obj)
{
    if (obj.mark) {
        unmark.ext.showMessage('success', 'This link has been added to your stream.<i class="icon-check"></i>');
        $('#edit-options').fadeIn('fast');
        unmark.ext.label_id           = obj.mark.label_id;
        unmark.ext.mark_id            = obj.mark.mark_id;
        unmark.ext.mark_info.mark_id  = obj.mark.mark_id;
        unmark.ext.mark_info.label_id = obj.mark.label_id;
        $('#submit').html('Update Mark');
    }
    else {
        unmark.ext.updateError();
    }
};

unmark.ext.addMark = function()
{
    delete unmark.ext.mark_info.mark_id;
    var query = '';
    for (var i in unmark.ext.mark_info) {
        query += '&' + i + '=' + unmark.urlEncode(unmark.ext.mark_info[i]);
    }
    unmark.ajax(unmark.paths.add, query.substring(1), 'POST', unmark.ext.addCallback, unmark.ext.updateError);
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

unmark.ext.closePopup = function()
{
    window.close();
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
        unmark.ext.showMessage('success', 'The mark was successfully updated. <i class="icon-check"></i>');
    }
    else {
        unmark.ext.updateError();
    }
};

unmark.ext.editMark = function()
{
    var query = 'label_id=' + unmark.urlEncode(unmark.ext.mark_info.label_id) + '&notes=' + unmark.urlEncode(unmark.ext.mark_info.notes);
    unmark.ajax(unmark.paths.edit + '/' + unmark.ext.mark_info.mark_id, query, 'POST', unmark.ext.editCallback, unmark.ext.updateError);
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
    var button   = (obj.mark) ? 'Update Mark' : 'Add Mark';
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
    $('#submit').html(button);
    //$('h1').html(button);

    // Set mark object goodies
    unmark.ext.mark_info.title    = unmark.ext.tab_title;
    unmark.ext.mark_info.url      =  unmark.ext.tab_url;
    unmark.ext.mark_info.label_id =  unmark.ext.label_id;
    unmark.ext.mark_info.notes    =  notes;
    unmark.ext.mark_info.mark_id  =  unmark.ext.mark_id;

    // Notes label
    if (! unmark.empty(notes)) {
        $('#notes-title').html('Edit Notes');
    }

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
            if (selected === true) {
                $('#label-chosen-name').html(obj.labels[i].name).addClass('label-' + obj.labels[i].label_id);
                //$('#label-chosen-id').html(obj.labels[i].label_id);
            }

            $('ul.label-choices').prepend('<li class="label-' + obj.labels[i].label_id + '"><a href="#" id="label-choice-' + obj.labels[i].label_id + '" rel="' + obj.labels[i].label_id + '"><span>' + obj.labels[i].name + '</span></a></li>');
        }

        // Store labels
        localStorage.setItem('unmark_labels', JSON.stringify(obj));

        var hover_span    = $('#label-chosen');
        var label_choices = $('ul.label-choices');
        var label_chosen  = $('#label-chosen-name');

        // Add click events
        label_choices.find('a').unbind();
        label_choices.find('a').on('click', function (e)
        {
            e.preventDefault();
            var obj = $(this);
            unmark.ext.label_id = obj.attr('id').split('-')[2];
            label_chosen.html(obj.find('span').html());
            label_chosen.removeClass().addClass(obj.parent().attr('class'));
            unmark.ext.toggleLabels();
            hover_span.hide().removeClass();
            unmark.ext.mark_info.label_id = unmark.ext.label_id;
        });

        label_choices.find('a').hover(
            function()
            {
                var obj   = $(this);
                var eyed  = obj.attr('id').split('-')[2];
                var label = obj.find('span').html();
                hover_span.addClass('label-' + eyed).html(label).show();
            },
            function()
            {
                hover_span.hide().removeClass();
            }
        );
    }

    //unmark.ext.log($('ul.label-choices').html());
};

unmark.ext.showMessage = function(type, msg)
{
    var color = (type == 'error') ? '#F2BBB8' : (type == 'success') ? '#49b3e2' : '#F0F593';
    var savedHeight = $('html').height();
    $('#message').html(msg).css('background', color).fadeIn('fast', function()
    {
        var timer = setTimeout(function()
        {
            $('#message').fadeOut('fast');
            $('html').height(savedHeight);
        }, 3500);
    });
};

unmark.ext.showNotes = function()
{
    var obj   = $('#notes');
    var notes = (obj.html() == '') ? unmark.ext.notes : obj.html();

    if (obj.is(':visible')) {
        var notes_title = (notes == unmark.ext.notes) ? 'Add A Note' : 'Edit Notes';
        notes           = (notes == unmark.ext.notes) ? '' : notes;
        obj.fadeOut();
        $('#notes-title').html(notes_title);
    }
    else {
       obj.html(notes).fadeIn();
    }

    unmark.ext.mark_info.notes = (notes == unmark.ext.notes) ? '' : notes;
};

unmark.ext.toggleLabels = function()
{
    var obj    = $('ul.label-choices').parent();
    var method = (obj.is(':visible')) ? 'fadeOut' : 'fadeIn';
    obj[method]();
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
        var method = ($(this).html().indexOf('Add') >= 0) ? 'addMark' : 'editMark';
        unmark.ext[method]();
    });

    $('a[href="#"], button[id!="submit"]').click(function(e)
    {
        e.preventDefault();
        var method = $(this).data('method');
        unmark.ext[method]();
    });

    $('#notes').click(function()
    {
        if ($("#notes").html() == unmark.ext.notes)
            $("#notes").html('');
    });

    $('#notes').keyup(function()
    {
        unmark.ext.mark_info.notes = $(this).html();
        unmark.ext.mark_info.notes = (unmark.empty(unmark.ext.mark_info.notes) || unmark.ext.mark_info.notes == 'null') ? '' : unmark.ext.mark_info.notes;
    });
});
