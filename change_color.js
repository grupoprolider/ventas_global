const fs = require('fs');

let html = fs.readFileSync('seguimiento.html', 'utf8');

// The line is: let darkBg = '#004d5a'; // Match the user's header/total color
html = html.replace("let darkBg = '#004d5a';", "let darkBg = '#A42A68';");

fs.writeFileSync('seguimiento.html', html);
console.log("Color updated!");
