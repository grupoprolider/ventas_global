const fs = require('fs');

let html = fs.readFileSync('panel_supervisor.html', 'utf8');

// Use a regular expression that handles whitespace flexibly
let regex = /<button class="btn-accion btn-ver-ranking"[^>]*>[\s\S]*?<\/button>/i;

let btnString = `<button class="btn-accion btn-ver-ranking" onclick="abrirRanking()">
                <i class="fa-solid fa-trophy"></i> Ver Ranking Nacional
            </button>
            <button class="btn-accion btn-ver-tablero" onclick="window.location.href='seguimiento.html'" style="background: linear-gradient(45deg, #006779, #004d5a); color: white; box-shadow: 0 4px 15px rgba(0,103,121,0.4);">
                <i class="fa-solid fa-table-list"></i> Ver Tablero de Seguimiento
            </button>`;

if (!html.includes('btn-ver-tablero')) {
    html = html.replace(regex, btnString);
    fs.writeFileSync('panel_supervisor.html', html);
    console.log('Added button to panel_supervisor.html successfully');
} else {
    console.log('Button already exists in panel_supervisor.html');
}
