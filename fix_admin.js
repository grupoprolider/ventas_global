const fs = require('fs');

let html = fs.readFileSync('admin_master.html', 'utf8');

// 1. Add table header (Nuevo Ingreso - Alta de Personal)
// Try with standard i and with \xed
html = html.replace(
`                            <th>Categoría</th>
                            <th>Acciones</th>`,
`                            <th>Categoría</th>
                            <th>PIN (Acceso)</th>
                            <th>Acciones</th>`
);

html = html.replace(
`                            <th>Categor\xeda</th>
                            <th>Acciones</th>`,
`                            <th>Categor\xeda</th>
                            <th>PIN (Acceso)</th>
                            <th>Acciones</th>`
);

// Fallback in case of weird encoding
html = html.replace(
`                            <th>Categora</th>
                            <th>Acciones</th>`,
`                            <th>Categora</th>
                            <th>PIN (Acceso)</th>
                            <th>Acciones</th>`
);


// 2. Add input in JS ONLY in cargarPersonal
// Let's use regex that specifically matches within the cargarPersonal function
let searchRegex = /(function cargarPersonal[\s\S]*?<\/select><\/td>)(<td><button class="btn-edit" onclick="renombrar\('perfiles')/g;
let replacement = `$1<td><input type="text" placeholder="PIN" value="\${p.pin_acceso || ''}" onchange="updatePerfil('\${p.id}', 'pin_acceso', this.value)" style="width:50px; padding:4px; text-align:center; font-weight:bold; border: 1px solid #ccc; border-radius: 4px;"></td>$2`;

html = html.replace(searchRegex, replacement);

// We need to also add pin_acceso to the Supabase select in admin_master.html?
// Let's check if they select pin_acceso.
// In the select: `clienteSupabase.from('perfiles').select('id, nombre, equipo_id, rol, categoria, objetivo_campana')` (maybe)
// Let's ensure pin_acceso is queried.
html = html.replace(
    `select('id, nombre, equipo_id, rol, categoria, objetivo_campana, estado')`,
    `select('id, nombre, equipo_id, rol, categoria, objetivo_campana, estado, pin_acceso')`
);
html = html.replace(
    `select('id, nombre, equipo_id, rol, categoria, objetivo_campana')`,
    `select('id, nombre, equipo_id, rol, categoria, objetivo_campana, pin_acceso')`
);
html = html.replace(
    `select('id, nombre, equipo_id, rol, categoria')`,
    `select('id, nombre, equipo_id, rol, categoria, pin_acceso')`
);

fs.writeFileSync('admin_master.html', html);
console.log('admin_master.html modified perfectly');
