const fs = require('fs');

let html = fs.readFileSync('seguimiento.html', 'utf8');

// The main script tag
let regex = /<script>([\s\S]*?)<\/script>/g;
let match;
while ((match = regex.exec(html)) !== null) {
    try {
        new Function(match[1]);
        console.log("Syntax OK for script block");
    } catch(e) {
        console.error("Syntax Error in script block:", e.message);
    }
}
