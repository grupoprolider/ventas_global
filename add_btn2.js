const fs = require('fs');

function addButton(filename) {
    if (!fs.existsSync(filename)) return;
    let html = fs.readFileSync(filename, 'utf8');
    
    let btnString = `            <button class="btn-accion btn-ranking" onclick="abrirRanking()">
                <i class="fa-solid fa-trophy"></i> Ver Ranking Completo
            </button>
            <button class="btn-accion btn-ver-tablero" onclick="window.location.href='seguimiento.html'" style="background: linear-gradient(45deg, #006779, #004d5a); color: white; box-shadow: 0 4px 15px rgba(0,103,121,0.4);">
                <i class="fa-solid fa-table-list"></i> Ver Tablero de Seguimiento
            </button>`;
            
    html = html.replace(`<button class="btn-accion btn-ranking" onclick="abrirRanking()">
                <i class="fa-solid fa-trophy"></i> Ver Ranking Completo
            </button>`, btnString);
            
    fs.writeFileSync(filename, html);
    console.log(`Updated ${filename}`);
}

addButton('panel_gerencia.html');
