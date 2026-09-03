const fs = require('fs');

let html = fs.readFileSync('panel_gerencia.html', 'utf8');

// Use a regular expression that handles whitespace flexibly
let regex = /<button class="btn-accion btn-ranking"[^>]*>[\s\S]*?<\/button>/i;

let btnString = `<button class="btn-accion btn-ranking" onclick="abrirRanking()">
                <i class="fa-solid fa-trophy"></i> Ver Ranking Completo
            </button>
            <button class="btn-accion btn-ver-tablero" onclick="window.location.href='seguimiento.html'" style="background: linear-gradient(45deg, #006779, #004d5a); color: white; box-shadow: 0 4px 15px rgba(0,103,121,0.4);">
                <i class="fa-solid fa-table-list"></i> Ver Tablero de Seguimiento
            </button>`;

html = html.replace(regex, btnString);

fs.writeFileSync('panel_gerencia.html', html);
console.log('Added button to panel_gerencia.html successfully');
