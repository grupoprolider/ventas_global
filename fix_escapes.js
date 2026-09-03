const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// The write_to_file tool call earlier had escaped string literals which caused \` and \${ to literally be in the code.
html = html.replace(/\\`/g, '`');
html = html.replace(/\\\${/g, '${');

fs.writeFileSync('index.html', html);
console.log('Fixed escaped backticks');
