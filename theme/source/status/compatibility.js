(function(){

  var parser = new UAParser();
  var browser = parser.getBrowser();

  document.getElementById('browser-value').innerHTML = browser.name;
  document.getElementById('version-value').innerHTML = browser.version;
  //console.log(browser);

  if (window.isCompatible()) {
    document.getElementById('message-compatible').className = "message";
  }else{
    document.getElementById('message-incompatible').className = "message";
  }
})();
