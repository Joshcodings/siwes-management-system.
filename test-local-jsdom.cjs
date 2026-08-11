const { JSDOM } = require('jsdom');
JSDOM.fromURL('http://localhost:4173/', {
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
    console.log('ROOT HTML:', dom.window.document.getElementById('root').innerHTML.substring(0, 300));
    process.exit(0);
  }, 3000);
}).catch(err => {
  console.log('JSDOM INIT ERROR:', err);
});
