unmark.context          = {};
unmark.current_tab      = {};

// Message writer when saving all tabs
unmark.context.allTabsMessage = function(total_tabs, total_processed, total_success, total_failed, auth_error)
{
    if (total_tabs == total_processed) {
        if (auth_error === true) {
            unmark.context.pushMessage('error', 'Please log into your account first and then try again.');
        }
        else if (total_success = total_tabs) {
            unmark.context.pushMessage('success', 'All tabs have been saved.');
        }
        else {
            unmark.context.pushMessage('notice', 'Not all tabs could be saved, please try again.');
        }
    }
};

unmark.context.check = function()
{
    unmark.ajax(unmark.paths.check, 'url=' + unmark.urlEncode(unmark.current_tab.url), 'GET', unmark.context.save, unmark.context.save);
};

// Handle the clicky clicks
unmark.context.chelseaHandler = function(info, tab)
{
    var is_page = (info.linkUrl === undefined) ? true : false;

    // For now only save pages
    // No easy way to get the link's page title
    if (tab && is_page === true) {
        unmark.current_tab = tab;
        unmark.ajax(unmark.paths.ping, '', 'GET', unmark.context.check, unmark.context.fail);
    }
};

unmark.context.fail = function(obj)
{
    var status = obj.status || -1;
    var err    = (status == '500' || status == '404' || obj.error === undefined) ? 'We could not save this page.' : (status == '403') ? 'Please log into your account first and then try again.' : obj.err;
    status     = (status > 0 && status != '403') ? ' (' + status + ')' : '';
    unmark.context.pushMessage('error', err + status);
};

// Handle saving all tabs
unmark.context.handleAllTabs = function(info, tab)
{
    unmark.current_tab = tab;
    unmark.ajax(unmark.paths.ping, '', 'GET', unmark.context.saveAllTabs, unmark.context.fail);
};

unmark.context.pushMessage = function(type, msg)
{
    type = (type == 'error') ? 'Error' : (type == 'success') ? 'Success' : 'Notice';
    msg  = type + ': ' + msg;
    unmark.context.sendMessage(unmark.current_tab.id, {'message': msg, 'screen_width': unmark.current_tab.width, 'screen_height': unmark.current_tab.height, 'type': type.toLowerCase()}, 1)

    var color = (type == 'Error') ? '#ff0000' : '#000000';
    var text  = (type == 'Error') ? 'ERR' : 'OK';
    chrome.browserAction.setBadgeBackgroundColor({'color': color});
    chrome.browserAction.setBadgeText({'text': text});

    var timer = setTimeout(function()
    {
        chrome.browserAction.setBadgeText({'text': ''});
    }, 2500);
};

unmark.context.save = function(obj)
{
    if (obj.mark) {
        unmark.context.pushMessage('notice', 'This page already exists in your account.');
    }
    else {
        var url   = unmark.current_tab.url;
        var title = unmark.current_tab.title;
        var query = 'url=' + unmark.urlEncode(url) + '&title=' + unmark.urlEncode(title) + '&notes=' + unmark.urlEncode('#chrome');
        unmark.ajax(unmark.paths.add, query, 'POST', unmark.context.success, unmark.context.fail);
    }
};

unmark.context.saveAllTabs = function()
{
    chrome.tabs.query({}, function(tabs)
    {
        var total_tabs      = tabs.length;
        var total_processed = 0;
        var total_success   = 0;
        var total_failed    = 0;
        var auth_error      = false;
        var title, url      = null;
        var ts              = new Date().getDateTime();

        for (var x in tabs) {
            title = tabs[x].title;
            url   = tabs[x].url;

            if (tabs[x].active === true) {
                unmark.current_tab = tabs[x];
            }

            if (url.indexOf('http') == 0) {
                var query = 'url=' + unmark.urlEncode(url) + '&title=' + unmark.urlEncode(title) + '&notes=' + unmark.urlEncode('#chrome #set-' + ts);
                unmark.ajax(unmark.paths.add, query, 'POST',
                    function(obj)
                    {
                        total_success   += (obj.mark) ? 1 : 0;
                        total_failed    += (! obj.mark) ? 1 : 0;
                        total_processed += 1;
                        unmark.context.allTabsMessage(total_tabs, total_processed, total_success, total_failed, auth_error);
                    },
                    function(obj)
                    {
                        total_failed    += 1;
                        total_processed += 1;
                        unmark.context.allTabsMessage(total_tabs, total_processed, total_success, total_failed, auth_error);
                    }
                );
            }
            else {
                total_tabs -= 1;
                unmark.context.allTabsMessage(total_tabs, total_processed, total_success, total_failed, auth_error);
            }
        }
    });
};

unmark.context.sendMessage = function(tab_id, obj, attempt)
{
    if (attempt <= 5) {
        chrome.tabs.sendMessage(tab_id, obj, function(res)
        {
            attempt += 1;
            unmark.context.sendMessage(tab_id, obj, attempt);
            //console.log(chrome.runtime.lastError);
        });
    }
    else {
        alert(obj.message);
    }
};

unmark.context.success = function(obj)
{
    if (obj.errors) {
        for (var i in obj.errors) {
            unmark.context.pushMessage('error', obj.errors[i] + '(' + i +')');
            break;
        }
    }
    else if (obj.mark) {
        unmark.context.pushMessage('success', 'This page has been saved to unmark.');
    }
    else {
        unmark.context.pushMessage('error', {});
    }
};

// Date prototype for dateTime
Date.prototype.getDateTime = function()
{
    var obj  = {
        'year'    : this.getFullYear(),
        'month'   : this.getMonth() + 1,
        'day'     : this.getDate(),
        'hours'   : this.getHours(),
        'minutes' : this.getMinutes(),
        'seconds' : this.getSeconds()
    };

    var res = '';

    for (var x in obj) {
        res += (obj[x] < 10) ? '0' + obj[x].toString() : obj[x].toString();
    }

    return res;
};

/*
// Removed for now
chrome.contextMenus.create(
{
    'title'               : 'Save link to unmark',
    'documentUrlPatterns' : ['http://*', 'https://*'],
    'contexts'            : ['link'],
    'onclick'             : unmark.context.chelseaHandler
});
*/

chrome.contextMenus.create(
{
    'title'               : 'Save this page to Unmark',
    'documentUrlPatterns' : ['http://*/*', 'https://*/*'],
    'contexts'            : ['selection'],
    'onclick'             : unmark.context.chelseaHandler
});

chrome.contextMenus.create(
{
    'title'               : 'Save this page',
    'documentUrlPatterns' : ['http://*/*', 'https://*/*'],
    'contexts'            : ['page'],
    'onclick'             : unmark.context.chelseaHandler
});

/*chrome.contextMenus.create(
{
    'title'               : 'Save all tabs',
    'contexts'            : ['page'],
    'onclick'             : unmark.context.handleAllTabs
});*/