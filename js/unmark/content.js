chrome.runtime.onMessage.addListener(function(request, sender, callback)
{
    // Figure width, height, top and left positions
    var unmark_div       = document.createElement('div');
    var sw              = parseInt(request.screen_width, 10);
    var sh              = parseInt(request.screen_height, 10);
    var w               = (sw < 400) ? sw : 400;
    var h               = (sh < 100) ? sh : 100;
    var l               = (sw - w) / 2;
    l                   = (l < 0) ? 0 : l;
    var t               = (sh - h) / 2;
    t                   = (t < 0) ? 0 : t;
    t                   = t + parseInt(document.body.scrollTop, 10);

    // Create new div
    // Set ID
    // Set innerHTML
    var unmark_div       = document.createElement('div');
    var type             = request.type.toLowerCase();
    var message          = (type == 'success') ? 'This page has been saved to your account.' : (type =='notice') ? 'This page already exists in your account.' : 'Please sign into your account and try again.';
    var markup           = '<div style="background-color:#333;color:#ccc;font-size:14px;text-transform:uppercase;width:99%;text-align:left;padding:10px;">' + request.type + '</div>';
    markup              += '<div style="background-color:#fff;color:#666;font-size:18px;padding:0.5%;width:99%;text-align:left;border-bottom: 5px solid #ddd;padding:25px 10px 25px 10px;">' + message + '</div>';
    unmark_div.id        = 'unmark-message';
    unmark_div.innerHTML = markup;

    // Set style attributes
    unmark_div.setAttribute('style', 'position:absolute;left:' + l + 'px;top:' + t + 'px;z-index:1;text-align:center;width:' + w + 'px;font-family: sans-serif;box-shadow: 7px 7px 30px #888;');

    // Add to DOM
    document.body.appendChild(unmark_div);

    // Remove element after 2.5 seconds
    var timer = setTimeout(function()
    {
        var elem = document.getElementById('unmark-message');
        document.body.removeChild(elem);
    }, 2500);
});