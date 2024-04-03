chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('twittybird.html', {
    'bounds': {
      'width': 680,
      'height': 500
    }
  });
});