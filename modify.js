const fs = require('fs');

let html = fs.readFileSync('seguimiento.html', 'utf8');

// I will find the part where the Fila Total Equipo is added.
// It ends with:
// matrixHtml += '</tr>';
// });
// matrixHtml += '</tbody></table>';

let searchBlock = `                    // Fila Total Equipo
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
                });

                matrixHtml += '</tbody></table>';`;

let newBlock = `                    // Fila Total Equipo
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
                    
                    // Accumulate for Sucursal
                    if (!totalesAgencia[eq.agencia_id]) {
                        totalesAgencia[eq.agencia_id] = {
                            ventas: 0,
                            monto: 0,
                            semTotals: Array(semanas.length).fill(0),
                            dayTotals: {},
                            color: agColor,
                            nombre: nombreAgencia
                        };
                        semanas.forEach(sem => {
                            totalesAgencia[eq.agencia_id].dayTotals[sem.id] = Array(diasPorSemana[sem.id].length).fill(0);
                        });
                    }
                    
                    totalesAgencia[eq.agencia_id].ventas += totalEqVentas;
                    totalesAgencia[eq.agencia_id].monto += totalEqMonto;
                    semanas.forEach((sem, idx) => {
                        totalesAgencia[eq.agencia_id].semTotals[idx] += semTotals[idx];
                        diasPorSemana[sem.id].forEach((dStr, dIdx) => {
                            totalesAgencia[eq.agencia_id].dayTotals[sem.id][dIdx] += dayEqTotals[sem.id][dIdx];
                        });
                    });
                });

                // Render Total Sucursal rows
                // Since teams were sorted by agency, the groups are contiguous. We can just loop through the accumulated agencies.
                let prevAgenciaId = null;
                // We need to re-iterate or just keep track in the original loop.
                // Wait! Since we accumulated everything in \`totalesAgencia\`, we can't easily insert them IN BETWEEN the teams unless we do it during the loop.
                // Let's modify the Fila Total Equipo logic to also check if it's the LAST team of this agency.`;

// Wait, the Fila Total Equipo is inside the \`equipos.forEach(eq => {\` loop.
// So inserting it AFTER Fila Total Equipo but BEFORE the next iteration is hard without checking the NEXT team.
fs.writeFileSync('modify.js', '/* will re-write */');
