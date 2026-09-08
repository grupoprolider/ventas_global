const fs = require('fs');

let html = fs.readFileSync('seguimiento.html', 'utf8');

// The original line:
// let darkBg = '#A42A68'; // Match the user's header/total color
// let borderStyle = 'border: 2px solid ' + darkBg + ';';

// I need to replace it with:
// let borderStyle = 'border: 2px solid ' + agColor + ';';
// But wait, `agColor` is declared inside `validEquipos.forEach`, so it IS accessible there!

html = html.replace(
    "let borderStyle = 'border: 2px solid ' + darkBg + ';';",
    "let borderStyle = 'border: 2px solid ' + agColor + ' !important;';"
);

// I'll also add a white border fallback just in case they meant a white separator. But usually `agColor` is what "the cells above it" have.
// Let's use `agColor` but add a `border-top` just to be safe. Actually, `agColor` is exactly what the cells above have.

fs.writeFileSync('seguimiento.html', html);
console.log("Border style fixed");
