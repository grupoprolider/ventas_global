const fs = require('fs');
let html = fs.readFileSync('admin_master.html', 'utf8');

// 1. In the headers for Personal tab:
// Search for <th>CATEGORÍA</th> or <th>Categoría</th> and insert <th>PIN (ACCESO)</th> before <th>ACCIONES</th>
// It looks like the headers are uppercase in the user's new dark theme: "NOMBRE", "EQUIPO", "ROL", "CATEGORÍA", "ACCIONES"

// Add header before ACCIONES in the personal tab
let headerRegex = /(<th[^>]*>CATEGOR[ÍIa-zA-Z]+<\/th>\s*)(<th[^>]*>ACCIONES<\/th>)/i;
if (headerRegex.test(html)) {
    html = html.replace(headerRegex, '$1<th style="text-align:center;">PIN (ACCESO)</th>\n$2');
} else {
    console.log("Could not find headers");
}

// 2. In cargarPersonal, add the td input before the edit button
// Find the exact JS code for the "Renombrar" button inside the string literal
let btnRegex = /(<td><button class="btn-edit" onclick="renombrar\('perfiles', '\${p\.id}', '\${p\.nombre}'\)">)/;
if (btnRegex.test(html)) {
    let tdInput = `<td><input type="text" placeholder="PIN" value="\${p.pin_acceso || ''}" onchange="updatePerfil('\${p.id}', 'pin_acceso', this.value)" style="width:60px; padding:6px; text-align:center; font-weight:bold; border: 1px solid #444; background: #222; color: #fff; border-radius: 4px;"></td>`;
    html = html.replace(btnRegex, tdInput + '$1');
} else {
    console.log("Could not find button in JS");
}

fs.writeFileSync('admin_master.html', html);
console.log("Added PIN logic correctly.");
