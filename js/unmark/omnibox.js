unmark.omnibox = {};
unmark.suggest = null;

unmark.omnibox.fail = function(obj)
{
    //console.log(obj);
    var marks = [];
    marks.push({'description': obj.err, 'content': obj.status});
    unmark.suggest(marks);
};

unmark.omnibox.success = function(obj)
{
    if (obj.marks) {
        var marks = [];
        for (i in obj.marks) {
            marks.push({'description': obj.marks[i].title, 'content': obj.marks[i].url});
        }
        unmark.suggest(marks);
    }
};


chrome.omnibox.onInputChanged.addListener(function(text, suggest)
{
    unmark.suggest = suggest;
    if (text.length > 3) {
        unmark.ajax(unmark.paths.search, 'q=' + unmark.urlEncode(text) + '&limit=5', 'GET', unmark.omnibox.success, unmark.omnibox.fail);
    }

});

chrome.omnibox.onInputEntered.addListener(function(text)
{
    chrome.tabs.getSelected(null, function(tab)
    {
        if ((text.indexOf('http') == 0)) {
            // Go to site
            chrome.tabs.update(tab.id, {'url' : text});
        } else {
            // Search on unmark
            chrome.tabs.update(tab.id, {'url' : unmark.host + unmark.paths.search + '?q=' + unmark.urlEncode(text)});
        }
    });
});