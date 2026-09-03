const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Quitar la caja de Ventas Hoy
let boxToRemove = `<div class="ranking-diario-caja">
                <div class="ranking-diario-titulo">🏆 Ventas Hoy</div>
                <div id="listaVentasHoy" class="ranking-diario-lista"></div>
            </div>`;
html = html.replace(boxToRemove, '');

// 2. Quitar el botón de Ver Tablero de Seguimiento
let btnToRemove = `<button onclick="window.location.href='seguimiento.html'" style="width:100%; margin-bottom:15px; padding:15px; background:linear-gradient(45deg, #006779, #004d5a); color:white; border:none; border-radius:10px; font-size:16px; font-weight:bold; cursor:pointer; box-shadow: 0 4px 15px rgba(0,103,121,0.4);"><i class="fa-solid fa-table-list"></i> VER TABLERO DE SEGUIMIENTO</button>`;
html = html.replace(btnToRemove, '');

// 3. Quitar la consulta de ventas de hoy del Promise.all
let promiseAllCodeOld = `                const [{ data: ventas }, { data: entrevistas }] = await Promise.all([
                    clienteSupabase.from('registro_ventas').select('vendedor_id, ventas_cerradas, created_at').gte('created_at', isoMidnight),
                    clienteSupabase.from('registro_entrevistas').select('vendedor_id, created_at').gte('created_at', isoMidnight)
                ]);`;
let promiseAllCodeNew = `                const [{ data: entrevistas }] = await Promise.all([
                    clienteSupabase.from('registro_entrevistas').select('vendedor_id, created_at').gte('created_at', isoMidnight)
                ]);
                let ventas = null;`;
html = html.replace(promiseAllCodeOld, promiseAllCodeNew);

fs.writeFileSync('index.html', html);
console.log('Modified index.html successfully!');
