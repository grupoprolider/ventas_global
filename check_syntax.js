const fs = require('fs');

let html = fs.readFileSync('seguimiento.html', 'utf8');

let startIndex = html.indexOf('<script>');
let endIndex = html.indexOf('</script>');

let js = html.substring(startIndex + 8, endIndex);

try {
    new Function(js);
    console.log("Syntax OK");
} catch(e) {
    console.error("Syntax Error:", e);
}
