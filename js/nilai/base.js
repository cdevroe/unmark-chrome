var nilai            = (nilai === undefined) ? {} : nilai;
nilai.host           = 'http://nilai.plain';
nilai.paths          = {
    'add'     : '/mark/add',
    'archive' : '/mark/archive',
    'check'   : '/mark/check',
    'edit'    : '/mark/edit',
    'labels'  : '/labels/normal',
    'ping'    : '/chrome/ping',
    'restore' : '/mark/restore',
    'search'  : '/marks/search'
};
nilai.special_chars  = {'\\+': '&#43;'};

nilai.ajax = function(path, query, method, success_callback, error_callback)
{
    method = method.toUpperCase();
    method = (method != 'GET' && method != 'POST') ? 'POST' : method;
    $.ajax({
        url: nilai.host + path,
        data: query,
        dataType: 'json',
        type: method,
        headers: {'X-Requested-With': 'XMLHttpRequest', 'X-Chrome-Extension': 'Nilai'},
        timeout: 2000,
        success: function(obj)
        {
            //nilai.ext.log('success');
            //nilai.ext.log(obj);
            //nilai.ext.log($.isFunction(success_callback));
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

            //nilai.ext.log('fail');
            //nilai.ext.log(obj);
            //nilai.ext.log($.isFunction(error_callback));

            if ($.isFunction(error_callback)) {
                error_callback(obj);
            }
        }
    });
};

nilai.empty = function(v)
{
    var l = (v !== undefined && v !== null) ? v.length : 0;
    return (v === false || v === '' || v === null || v === 0 || v === undefined || l < 1);
};

nilai.isset = function(v)
{
    return (v !== undefined);
};

nilai.replaceSpecial = function(str)
{
    if (str !== undefined && str !== null) {
        var regex = null;
        for (var i in nilai.special_chars) {
            regex = new RegExp(i, 'gi');
            str   = str.replace(regex, nilai.special_chars[i]);
        }
    }
    return str;
};

nilai.urlEncode = function(str)
{
    return encodeURIComponent(nilai.replaceSpecial(str));
};