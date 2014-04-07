chrome.bookmarks.onCreated.addListener(function(id, bookmark)
{
    unmark.storageGet('autosave', function(setting)
    {
        if (setting.autosave === true) {
            var query = 'url=' + unmark.urlEncode(bookmark.url) + '&title=' + unmark.urlEncode(bookmark.title) + '&notes=' + unmark.urlEncode('#chrome #autosave');
            unmark.ajax(unmark.paths.add, query, 'POST',
                function(obj)
                {
                    unmark.storage_type = 'local';
                    unmark.storageGet('synced_marks', function(obj)
                    {
                        obj.synced_marks = (obj.synced_marks instanceof Array) ? obj.synced_marks : [];
                        obj.synced_marks.push(id);
                        unmark.storageSet({'synced_marks': obj.synced_marks});
                    });
                },
                function()
                {
                    // Fail silently
                }
            );
        }
    });
});