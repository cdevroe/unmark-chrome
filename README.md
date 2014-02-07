## Hey There
Here is our code for Nilai's Chrome extension. Feel free to use it. Below are a few instructions on how to customize it to work with your domain.

## Using your own host
If you want to simply change the endpoint for this extension it's pretty simple.

* Open `manifest.json` and find the block that looks like:

```
"permissions": [
    "tabs",
    "contextMenus",
    "*://nilai.plain/"
  ],
```

Change the last line to match your site.

* Open `js/nilai/base.js` and change line 2 to point to the correct endpoint.

```
nilai.host = 'http://nilai.plain';
```

* Save

## Loading your version in Chrome
Now you should be able to load the unpacked extension locally and test. To do that simply follow these instructions:

* Go To `chrome:://extensions` in Chrome.
* Check the `Developer Mode` checkbox
* Click the button that says `Load unpacked extension`
* Choose the location of your code


## Shipping your version
When you are ready to ship, just choose the `Pack extension...` button and follow the instructions.