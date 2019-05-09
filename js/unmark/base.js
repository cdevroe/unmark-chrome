var unmark            = (unmark === undefined) ? {} : unmark;
unmark.host           = 'http://localhost';
unmark.paths          = {
    'add'     : '/mark/add',
    'archive' : '/mark/archive',
    'check'   : '/mark/check',
    'delete'  : '/mark/delete',
    'edit'    : '/mark/edit',
    'labels'  : '/labels/normal',
    'ping'    : '/chrome/ping',
    'restore' : '/mark/restore',
    'search'  : '/marks/search'
};
unmark.special_chars  = {'\\+': '&#43;'};

unmark.ajax = function(path, query, method, success_callback, error_callback)
{
    method = method.toUpperCase();
    method = (method != 'GET' && method != 'POST') ? 'POST' : method;
    $.ajax({
        url: unmark.host + path,
        data: query,
        dataType: 'json',
        type: method,
        headers: {'X-Requested-With': 'XMLHttpRequest', 'X-Chrome-Extension': '1'},
        timeout: 2000,
        success: function(obj)
        {
            //unmark.ext.log('success');
            //unmark.ext.log(obj);
            //unmark.ext.log($.isFunction(success_callback));
            if ($.isFunction(success_callback)) {
                success_callback(obj);
            }
        },
        error: function(xhr, status, err)
        {
            var obj = {'xhr': xhr, 'status': status, 'error': err};

            if (xhr.responseJSON.errors) {
                for (var i in xhr.responseJSON.errors) {
                    obj.status = i;
                    obj.error  = xhr.responseJSON.errors[i];
                }
            }

            //unmark.ext.log('fail');
            //unmark.ext.log(obj);
            //unmark.ext.log($.isFunction(error_callback));

            if ($.isFunction(error_callback)) {
                error_callback(obj);
            }
        }
    });
};

unmark.empty = function(v)
{
    var l = (v !== undefined && v !== null) ? v.length : 0;
    return (v === false || v === '' || v === null || v === 0 || v === undefined || l < 1);
};

unmark.isset = function(v)
{
    return (v !== undefined);
};

unmark.replaceSpecial = function(str)
{
    if (str !== undefined && ! unmark.empty(str)) {
        var regex = null;
        for (var i in unmark.special_chars) {
            regex = new RegExp(i, 'gi');
            str   = str.replace(regex, unmark.special_chars[i]);
        }
    }
    return str;
};

unmark.urlEncode = function(str)
{
    return encodeURIComponent(unmark.replaceSpecial(str));
};