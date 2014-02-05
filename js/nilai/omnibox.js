nilai.omnibox = {};
nilai.suggest = null;

nilai.omnibox.fail = function(obj)
{
    //console.log(obj);
    var marks = [];
    marks.push({'description': obj.err, 'content': obj.status});
    nilai.suggest(marks);
};

nilai.omnibox.success = function(res)
{
    //console.log(res);
    if (res.marks) {
        var marks = [];
        for (s in res.marks) {
            marks.push({'description': res.marks[s].title, 'content': res.marks[s].url});
        }
        nilai.suggest(marks);
    }
};


chrome.omnibox.onInputChanged.addListener(function(text, suggest)
{
    nilai.suggest = suggest;
    if (text.length > 3) {
        nilai.ajax(nilai.paths.search, 'q=' + nilai.urlEncode(text) + '&limit=5', 'GET', nilai.omnibox.success, nilai.omnibox.fail);
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
            // Search on nilai
            chrome.tabs.update(tab.id, {'url' : nilai.host + nilai.paths.search + '?q=' + nilai.urlEncode(text)});
        }
    });
});