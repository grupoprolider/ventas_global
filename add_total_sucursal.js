const fs = require('fs');

let html = fs.readFileSync('seguimiento.html', 'utf8');

// Step 1: Replace equipos.forEach(eq => { ... })
// We will replace the entire block starting from `equipos.forEach(eq => {`
// Let's use string manipulation based on known markers.

let startMarker = `let filtroAgenciaId = document.getElementById('filtroAgencia') ? document.getElementById('filtroAgencia').value : 'todas';`;
let endMarker = `document.getElementById('contenedor-tabla').innerHTML = matrixHtml;`;

let blockStartIndex = html.indexOf(startMarker);
let blockEndIndex = html.indexOf(endMarker, blockStartIndex);

if (blockStartIndex === -1 || blockEndIndex === -1) {
    console.error("Could not find markers!");
    process.exit(1);
}

let codeToReplace = html.substring(blockStartIndex, blockEndIndex);

let newCode = `let filtroAgenciaId = document.getElementById('filtroAgencia') ? document.getElementById('filtroAgencia').value : 'todas';

                let validEquipos = equipos.filter(eq => {
                    if (filtroAgenciaId !== 'todas' && eq.agencia_id !== filtroAgenciaId) return false;
                    let vends = perfiles.filter(p => {
                        if (p.equipo_id !== eq.id) return false;
                        if (p.nombre.includes('(BAJA)')) {
                            let mis = ventas.filter(vent => vent.vendedor_id === p.id);
                            let mTot = mis.reduce((sum, vent) => sum + Number(vent.ventas_cerradas || 0) - Number(vent.bajas || 0), 0);
                            if (mTot <= 0) return false;
                        }
                        return true;
                    });
                    return vends.length > 0;
                });

                let totalesAgencia = { ventas: 0, monto: 0 };
                let agSemTotals = Array(semanas.length).fill(0);
                let agDayTotals = {};
                semanas.forEach(sem => { agDayTotals[sem.id] = Array(diasPorSemana[sem.id].length).fill(0); });
                
                validEquipos.forEach((eq, index) => {
                    let agencia = agencias.find(a => a.id === eq.agencia_id);
                    let nombreAgencia = agencia ? agencia.nombre : 'Desconocida';
                    
                    let vendsEquipo = perfiles.filter(p => {
                        if (p.equipo_id !== eq.id) return false;
                        if (p.nombre.includes('(BAJA)')) {
                            let misVentas = ventas.filter(vent => vent.vendedor_id === p.id);
                            let miTotalVentas = misVentas.reduce((sum, vent) => sum + Number(vent.ventas_cerradas || 0) - Number(vent.bajas || 0), 0);
                            if (miTotalVentas <= 0) return false;
                        }
                        return true;
                    });

                    let totalEqVentas = 0;
                    let totalEqMonto = 0;
                    let semTotals = Array(semanas.length).fill(0);
                    let dayEqTotals = {}; 
                    semanas.forEach(sem => { dayEqTotals[sem.id] = Array(diasPorSemana[sem.id].length).fill(0); });

                    let agColor = agencia && agencia.color_hex ? agencia.color_hex : '#ddd';
                    let tdStyle = 'border: 2px solid ' + agColor + ';';
                    
                    vendsEquipo.forEach(v => {
                        let misVentas = ventas.filter(vent => vent.vendedor_id === v.id);
                        let miTotalVentas = misVentas.reduce((sum, vent) => sum + Number(vent.ventas_cerradas || 0) - Number(vent.bajas || 0), 0);
                        let miTotalMonto = misVentas.reduce((sum, vent) => sum + Number(vent.monto || 0), 0);

                        totalEqVentas += miTotalVentas;
                        totalEqMonto += miTotalMonto;

                        matrixHtml += '<tr>';
                        matrixHtml += '<td class="td-sucursal" style="'+tdStyle+'">' + nombreAgencia + '</td>';
                        let nombreMostrar = v.nombre;
                        if (v.rol && v.rol !== 'Vendedor') {
                            nombreMostrar += ' <span style="font-size:0.8em; color:#666;">(Líder)</span>';
                        }
                        
                        matrixHtml += '<td class="td-asesor" style="'+tdStyle+'">' + nombreMostrar + '</td>';
                        matrixHtml += '<td style="'+tdStyle+'">' + eq.nombre + '</td>';

                        semanas.forEach((sem, idx) => {
                            let vNetas = getVentasEnSemana(v.id, sem.fecha_inicio, sem.fecha_fin);
                            semTotals[idx] += vNetas;
                            
                            let colorClass = 'color-red';
                            if (sem.objetivo === 0) colorClass = '';
                            else if (vNetas >= sem.objetivo) colorClass = 'color-green';
                            else if (vNetas > 0) colorClass = 'color-yellow';
                            
                            // Celdas diarias
                            diasPorSemana[sem.id].forEach((dStr, dIdx) => {
                                let vDia = getVentasEnDia(v.id, dStr);
                                dayEqTotals[sem.id][dIdx] += vDia;
                                matrixHtml += '<td class="day-col-'+sem.id+'" style="display:none; '+tdStyle+' font-size:12px; color:#555;">' + (vDia > 0 ? vDia : '-') + '</td>';
                            });
                            matrixHtml += '<td class="obj-cell ' + colorClass + '" style="'+tdStyle+'">' + vNetas + '</td>';
                        });

                        matrixHtml += '<td style="font-weight:bold; ' + tdStyle + '">' + miTotalVentas + '</td>';
                        matrixHtml += '<td style="' + tdStyle + '">\$' + miTotalMonto.toLocaleString('es-AR') + '</td>';
                        matrixHtml += '</tr>';
                    });

                    // Fila Total Equipo
                    matrixHtml += '<tr class="row-equipo-total">';
                    matrixHtml += '<td colspan="3" style="text-align:center; ' + tdStyle + ' border-top:none;">TOTAL EQUIPO ' + eq.nombre.toUpperCase() + '</td>';
                    semanas.forEach((sem, idx) => {
                        diasPorSemana[sem.id].forEach((dStr, dIdx) => {
                             let vTot = dayEqTotals[sem.id][dIdx];
                             matrixHtml += '<td class="day-col-'+sem.id+'" style="display:none; '+tdStyle+' border-top:none; font-size:12px; color:#ccc;">' + (vTot > 0 ? vTot : '-') + '</td>';
                        });
                        matrixHtml += '<td style="' + tdStyle + ' border-top:none;">' + semTotals[idx] + '</td>';
                    });
                    matrixHtml += '<td style="' + tdStyle + ' border-top:none;">' + totalEqVentas + '</td>';
                    matrixHtml += '<td style="' + tdStyle + ' border-top:none;">\\$' + totalEqMonto.toLocaleString('es-AR') + '</td>';
                    matrixHtml += '</tr>';
                    
                    // ACCUMULATE INTO TOTAL SUCURSAL
                    totalesAgencia.ventas += totalEqVentas;
                    totalesAgencia.monto += totalEqMonto;
                    semanas.forEach((sem, idx) => {
                        agSemTotals[idx] += semTotals[idx];
                        diasPorSemana[sem.id].forEach((dStr, dIdx) => {
                            agDayTotals[sem.id][dIdx] += dayEqTotals[sem.id][dIdx];
                        });
                    });

                    // IS IT THE LAST TEAM FOR THIS SUCURSAL?
                    let isLastForAgencia = true;
                    if (index < validEquipos.length - 1) {
                        if (validEquipos[index + 1].agencia_id === eq.agencia_id) {
                            isLastForAgencia = false;
                        }
                    }

                    if (isLastForAgencia) {
                        let darkBg = '#004d5a'; // Match the user's header/total color
                        let borderStyle = 'border: 2px solid ' + darkBg + ';';
                        matrixHtml += '<tr style="background-color: ' + darkBg + '; color: white; font-weight: bold;">';
                        matrixHtml += '<td colspan="3" style="text-align:center; ' + borderStyle + '">TOTAL SUCURSAL ' + nombreAgencia.toUpperCase() + '</td>';
                        semanas.forEach((sem, idx) => {
                            diasPorSemana[sem.id].forEach((dStr, dIdx) => {
                                 let vTot = agDayTotals[sem.id][dIdx];
                                 matrixHtml += '<td class="day-col-'+sem.id+'" style="display:none; '+borderStyle+' font-size:12px; color:#fff;">' + (vTot > 0 ? vTot : '-') + '</td>';
                            });
                            matrixHtml += '<td style="' + borderStyle + '">' + agSemTotals[idx] + '</td>';
                        });
                        matrixHtml += '<td style="' + borderStyle + '">' + totalesAgencia.ventas + '</td>';
                        matrixHtml += '<td style="' + borderStyle + '">\\$' + totalesAgencia.monto.toLocaleString('es-AR') + '</td>';
                        matrixHtml += '</tr>';

                        // Reset accumulators for next branch
                        totalesAgencia.ventas = 0;
                        totalesAgencia.monto = 0;
                        agSemTotals = Array(semanas.length).fill(0);
                        semanas.forEach(sem => { agDayTotals[sem.id] = Array(diasPorSemana[sem.id].length).fill(0); });
                    }
                });

                matrixHtml += '</tbody></table>';
                `;

html = html.substring(0, blockStartIndex) + newCode + html.substring(blockEndIndex);

fs.writeFileSync('seguimiento.html', html);
console.log("Updated seguimiento.html successfully!");
