const { JSDOM } = require('jsdom');
JSDOM.fromURL('https://siwes-management-system-el0j.onrender.com/', {
  runScripts: 'dangerously',
  resources: 'usable',
  pretendToBeVisual: true
}).then(dom => {
  dom.window.onerror = function(msg, url, line, col, error) {
    console.log('WINDOW ERROR:', msg, error);
  };
  dom.window.console.error = function(...args) {
    console.log('CONSOLE ERROR:', ...args);
  };
  setTimeout(() => {
    console.log('ROOT HTML:', dom.window.document.getElementById('root').innerHTML.substring(0, 200));
    process.exit(0);
  }, 10000);
});
