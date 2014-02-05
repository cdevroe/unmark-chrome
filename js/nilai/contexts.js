nilai.context     = {};
nilai.current_tab = {};

// Handle the clicky clicks
nilai.context.chelseaHandler = function(info, tab)
{
    var is_page = (info.linkUrl === undefined) ? true : false;

    // For now only save pages
    // No easy way to get the link's page title
    if (tab && is_page === true) {
        nilai.current_tab = tab;
        var url   = tab.url;
        var title = tab.title;
        var query = 'url=' + nilai.urlEncode(url) + '&title=' + nilai.urlEncode(title) + '&notes=' + nilai.urlEncode('#chrome');
        nilai.ajax(nilai.paths.add, query, 'POST', nilai.context.success, nilai.context.fail);
        //console.log("item " + info.menuItemId + " was clicked");
        //console.log("info: " + JSON.stringify(info));
        //console.log("tab: " + JSON.stringify(tab));

    }
};

nilai.context.fail = function(obj)
{
    var status = obj.status || -1;
    var err    = (status == '500' || status == '404' || obj.err === undefined) ? 'We could not save this page.' : (status == '403') ? 'Please log into your account first and then try again.' : obj.err;
    status     = (status > 0) ? ' (' + status + ')' : '';
    nilai.context.pushMessage('error', err + status);
};

nilai.context.pushMessage = function(type, msg)
{
    type = (type == 'error') ? 'Error' : 'Success';
    msg  = type + ': ' + msg;
    chrome.tabs.sendMessage(nilai.current_tab.id, {'message': msg, 'screen_width': nilai.current_tab.width, 'screen_height': nilai.current_tab.height, 'type': type.toLowerCase()}, function() {});

    var color = (type == 'Error') ? '#ff0000' : '#000000';
    var text  = (type == 'Error') ? 'ERR' : 'OK';
    chrome.browserAction.setBadgeBackgroundColor({'color': color});
    chrome.browserAction.setBadgeText({'text': text});

    var timer = setTimeout(function()
    {
        chrome.browserAction.setBadgeText({'text': ''});
    }, 2500);
};


nilai.context.success = function(res)
{
    //console.log(res);
    if (res.errors) {
        for (var i in res.errors) {
            nilai.context.pushMessage('error', {'err': res.errors[i], 'status': i});
            break;
        }
    }
    else if (res.mark) {
        nilai.context.pushMessage('success', 'This page has been saved to Nilai.');
    }
    else {
        nilai.context.pushMessage('error', {});
    }
};

/*
// Removed for now
chrome.contextMenus.create(
{
    'title'               : 'Save link to Nilai',
    'documentUrlPatterns' : ['http://*', 'https://*'],
    'contexts'            : ['link'],
    'onclick'             : nilai.context.chelseaHandler
});
*/

chrome.contextMenus.create(
{
    'title'               : 'Save page to Nilai',
    'documentUrlPatterns' : ['http://*/*', 'https://*/*'],
    'contexts'            : ['page'],
    'onclick'             : nilai.context.chelseaHandler
});
