const fs = require('fs');

let html = fs.readFileSync('seguimiento.html', 'utf8');

// The original Fila Total Equipo logic already had a variable named let totalesAgencia = ...
// We just need to remove the first one, or rename the second one.

html = html.replace('let totalesAgencia = { ventas: 0, monto: 0 };\n                let currentAgenciaId = null;', '');

fs.writeFileSync('seguimiento.html', html);
console.log("Fixed duplicate variable declaration");
