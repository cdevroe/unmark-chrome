var unmark              = (unmark === undefined) ? {} : unmark;
unmark.bookmarks        = {};
unmark.bookmarks.list   = [];
unmark.bookmarks.totals = {};
unmark.bookmarks.timers = {};
unmark.bookmarks.to_save = [];
unmark.bookmarks.current_w = 0;
unmark.bookmarks.synced    = [];
unmark.bookmarks.total     = 0;

unmark.bookmarks.digest = function()
{
    unmark.bookmarks.totals.total      = $('input[id^="import-"]:checked').length;
    unmark.bookmarks.totals.success    = 0;
    unmark.bookmarks.totals.failed     = 0;
    unmark.bookmarks.totals.processed  = 0;
    unmark.bookmarks.to_save           = [];
    unmark.bookmarks.current_w         = 0;

    if (unmark.bookmarks.totals.total > 0) {
        $('#message').hide();
        $('#progress').html('0%').fadeIn('fast').width('25px');
        var eyed = '';
        $('input[id^="import-"]:checked').each(function()
        {
            eyed = $(this).attr('id').split('-')[1];
            unmark.bookmarks.to_save.push({
                'query': 'url=' + unmark.urlEncode(unmark.bookmarks.list[eyed].url) + '&title=' + unmark.urlEncode(unmark.bookmarks.list[eyed].title) + '&notes=' + unmark.urlEncode('#chromeImport'),
                'chrome_id': unmark.bookmarks.list[eyed].id,
                'eyed': eyed
            });
        });
        unmark.bookmarks.save();

        unmark.bookmarks.timers.message = setInterval(function()
        {
            if (unmark.bookmarks.totals.total == unmark.bookmarks.totals.processed) {
                clearInterval(unmark.bookmarks.timers.message);
                $('#progress').hide();
                unmark.bookmarks.writeMessage(unmark.bookmarks.totals.success + ' out of ' + unmark.bookmarks.totals.total + ' bookmarks successfully saved to Unmark.');
            }
        }, 1);
    }
    else {
        unmark.bookmarks.writeMessage('Please select at least one bookmark to import.');
    }
};

unmark.bookmarks.fail = function(obj)
{
    var status = obj.status || -1;
    var err    = (status == '500' || status == '404' || obj.error === undefined) ? 'Something went wrong.' : (status == '403') ? 'Please log into your account first and then try again.' : obj.error;
    status     = (status > 0 && status != '403') ? ' (' + status + ')' : '';
    unmark.bookmarks.writeMessage(err + status);
};

unmark.bookmarks.get = function(bookmarks)
{
    var found = false;
    bookmarks.forEach(function(bookmark) {
        if (bookmark.children && bookmark.children.length > 0) {
            unmark.bookmarks.get(bookmark.children);
        }
        else if (bookmark.url !== undefined && bookmark.url.indexOf('http') == 0) {
            found = false;
            for (var i = 0; i <= unmark.bookmarks.synced.length; i++) {
                if (unmark.bookmarks.synced[i] == bookmark.id) {
                    found = true;
                }
            }

            if (found === false) {
                unmark.bookmarks.list.push({'title': bookmark.title, 'url': bookmark.url, 'id': bookmark.id});
                unmark.bookmarks.total += 1;
                unmark.bookmarks.updateTotal();
            }
        }
    });
};

unmark.bookmarks.save = function()
{
    if (unmark.bookmarks.to_save.length > 0) {
        var query     = unmark.bookmarks.to_save.shift();
        var chrome_id = query.chrome_id;
        var eyed      = query.eyed;
        query         = query.query;
        unmark.ajax(unmark.paths.add, query, 'POST',
        function(obj)
        {
            if (obj.mark) {
                unmark.bookmarks.totals.success += 1;
                unmark.bookmarks.synced.push(chrome_id);
                unmark.storage_type = 'local';
                unmark.storageSet({'synced_marks': unmark.bookmarks.synced});
                $('input[id^="import-' + eyed + '"]').attr('disabled', true);
                $('input[id^="import-' + eyed + '"]').parent().fadeOut('slow');
                unmark.bookmarks.total -= 1;
                unmark.bookmarks.updateTotal();
            }
            else {
                unmark.bookmarks.totals.failed += 1;
            }
            unmark.storage_type = 'sync';
            unmark.bookmarks.update();
        },
        function(obj)
        {
            unmark.bookmarks.totals.failed += 1;
            unmark.bookmarks.update();
        });
    }
};

unmark.bookmarks.set = function()
{
    var bookmarks = $('#bookmarks');
    for (var i in unmark.bookmarks.list) {
        bookmarks.append('<div><input type="checkbox" id="import-' + i + '" name="bookmark-' + i + '">&nbsp;&nbsp;<label for="import-' + i + '">' + unmark.bookmarks.list[i].title + '</label></div>');
    }
};

unmark.bookmarks.update = function()
{
    var max_width  = 800;
    var min_width  = 25;
    var growth_per = Math.ceil(max_width / unmark.bookmarks.totals.total);
    unmark.bookmarks.totals.processed += 1;
    unmark.bookmarks.current_w += growth_per;
    unmark.bookmarks.current_w = (unmark.bookmarks.current_w < min_width) ? min_width : unmark.bookmarks.current_w;
    unmark.bookmarks.current_w = (unmark.bookmarks.current_w > max_width) ? max_width : unmark.bookmarks.current_w;
    $('#progress').width(unmark.bookmarks.current_w + 'px').html(Math.floor((unmark.bookmarks.totals.processed / unmark.bookmarks.totals.total) * 100) + '%');
    unmark.bookmarks.save();
};

unmark.bookmarks.updateTotal = function()
{
    $('#total-bookmarks').html(unmark.bookmarks.total);
};

unmark.bookmarks.writeMessage = function(msg)
{
    $('#message').html(msg).fadeIn('fast');
};

chrome.bookmarks.getTree(function(bookmarks)
{
    unmark.storage_type = 'local';
    unmark.storageGet('synced_marks', function(obj)
    {
        unmark.bookmarks.synced = (obj.synced_marks instanceof Array) ? obj.synced_marks : [];
        unmark.bookmarks.get(bookmarks);
        unmark.bookmarks.set();
        unmark.storage_type     = 'sync';
    });
});

$(document).ready(function()
{
    // Figure to check the autosave option or not on load
    unmark.storageGet('autosave', function(obj)
    {
        if (obj.autosave === true) {
            $('#auto-save-bookmarks').prop('checked', true);
        }
    });

    // Select all marks
    $('#select').click(function(e)
    {
        e.preventDefault();
        $('input[id^="import-"]').prop('checked', true);
    });

    // Deselect all marks
    $('#deselect').click(function(e)
    {
        e.preventDefault();
        $('input[id^="import-"]').prop('checked', false);
    });

    // Digest marks
    $('#digest').click(function(e)
    {
        e.preventDefault();
        unmark.ajax(unmark.paths.ping, '', 'GET', unmark.bookmarks.digest, unmark.bookmarks.fail);
    });

    // Autosave option toggle
    $('#auto-save-bookmarks').click(function()
    {
        var checked = $(this).is(':checked');
        unmark.storageSet({'autosave': checked});
    });
});