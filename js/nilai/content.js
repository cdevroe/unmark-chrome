chrome.runtime.onMessage.addListener(function(request, sender, callback)
{
    // Figure width, height, top and left positions
    var nilai_div       = document.createElement('div');
    var sw              = parseInt(request.screen_width, 10);
    var sh              = parseInt(request.screen_height, 10);
    var w               = (sw < 500) ? sw : 500;
    var h               = (sh < 100) ? sh : 100;
    var l               = (sw - w) / 2;
    l                   = (l < 0) ? 0 : l;
    var t               = (sh - h) / 2;
    t                   = (t < 0) ? 0 : t;
    t                   = t + parseInt(document.body.scrollTop, 10);

    // Create new div
    // Set ID
    // Set innerHTML
    var nilai_div       = document.createElement('div');
    nilai_div.id        = 'nilai-message';
    nilai_div.innerHTML = request.message;

    var color = (request.type == 'error') ? 'F2BBB8' : '73D9B7';

    // Set style attributes
    nilai_div.setAttribute('style', 'position:absolute;left:' + l + 'px;top:' + t + 'px;z-index:1;text-align:center;background-color:#' + color + ';color:#000;width:' + w + 'px;height:' + h + 'px;line-height:' + h + 'px;font-size:16px;font-family: Helvetica;');

    // Add to DOM
    document.body.appendChild(nilai_div);

    // Remove element after 2.5 seconds
    var timer = setTimeout(function()
    {
        var elem = document.getElementById('nilai-message');
        document.body.removeChild(elem);

    }, 2500);
});