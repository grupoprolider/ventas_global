
        const clienteSupabase = supabase.createClient('https://pumpwqyazqaxeeknrhyo.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1bXB3cXlhenFheGVla25yaHlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MjQ4ODEsImV4cCI6MjA5NDIwMDg4MX0.-AQZZYAt-uskDLUpbiafJXbHgW0lErf8bwEnk7eq1DE');

        
        function exportarExcel() {
            let table = document.getElementById("tabla-seguimiento");
            if (!table) return alert("No hay datos para exportar.");
            let wb = XLSX.utils.table_to_book(table, {sheet:"Seguimiento"});
            XLSX.writeFile(wb, "Seguimiento_Semanal_" + document.getElementById('titulo-campana').innerText.trim() + ".xlsx");
        }

        async function cargarData() {
            try {
                // Calcular campaña actual
                
                // Traer todas las semanas
                const { data: todasSemanas } = await clienteSupabase
                    .from('semanas_config')
                    .select('*')
                    .order('fecha_inicio', { ascending: true });

                let semanas = [];
                let campanaActual = 'Sin Campaña';
                if (todasSemanas && todasSemanas.length > 0) {
                    // Agrupar por la campaña que tiene la semana más reciente o actual
                    // Simplemente tomamos la campaña de la última semana configurada
                    campanaActual = todasSemanas[todasSemanas.length - 1].campana;
                    semanas = todasSemanas.filter(s => s.campana === campanaActual);
                }

                document.getElementById('titulo-campana').innerText = campanaActual;
                if (!semanas || semanas.length === 0) {
                    document.getElementById('contenedor-tabla').innerHTML = '<div style="text-align:center; padding:50px; color:#aaa; font-size:18px;">No hay semanas configuradas para ' + campanaActual + ' aún. El administrador debe configurarlas en el panel Maestro.</div>';
                    return;
                }

                // Traer catálogos
                const { data: perfiles } = await clienteSupabase.from('perfiles').select('id, nombre, equipo_id, rol');
                const { data: equipos } = await clienteSupabase.from('equipos').select('id, nombre, agencia_id');
                const { data: agencias } = await clienteSupabase.from('agencias').select('id, nombre, color_hex');

                // Traer todas las ventas (paginadas) para no perder ninguna
                let earliestDate = new Date(semanas[0].fecha_inicio + 'T00:00:00');
                let latestDate = new Date(semanas[semanas.length - 1].fecha_fin + 'T23:59:59');
                
                let ventas = [];
                let fromStr = earliestDate.toISOString();
                let toStr = latestDate.toISOString();
                
                let page = 0; let pageSize = 1000; let hasMore = true;
                while(hasMore) {
                    const { data: vPage } = await clienteSupabase
                        .from('registro_ventas')
                        .select('vendedor_id, monto, created_at, es_anulada, ventas_cerradas, bajas')
                        .gte('created_at', fromStr)
                        .lte('created_at', toStr)
                        .range(page * pageSize, (page + 1) * pageSize - 1);
                        
                    if (vPage && vPage.length > 0) {
                        ventas = ventas.concat(vPage);
                        if (vPage.length < pageSize) hasMore = false;
                        else page++;
                    } else hasMore = false;
                }

                // Función auxiliar para saber las ventas netas de un vendedor en una semana específica
                
                // Funciones auxiliares
                const getVentasEnSemana = (vendedorId, fechaIniStr, fechaFinStr) => {
                    let dIni = new Date(fechaIniStr + 'T00:00:00');
                    let dFin = new Date(fechaFinStr + 'T23:59:59');
                    let vts = ventas.filter(v => v.vendedor_id === vendedorId);
                    let vtsEnRango = vts.filter(v => { let d = new Date(v.created_at); return d >= dIni && d <= dFin; });
                    return vtsEnRango.reduce((sum, v) => sum + Number(v.ventas_cerradas || 0) - Number(v.bajas || 0), 0);
                };
                
                const getVentasEnDia = (vendedorId, fechaStr) => {
                    let dIni = new Date(fechaStr + 'T00:00:00');
                    let dFin = new Date(fechaStr + 'T23:59:59');
                    let vts = ventas.filter(v => v.vendedor_id === vendedorId);
                    let vtsEnRango = vts.filter(v => { let d = new Date(v.created_at); return d >= dIni && d <= dFin; });
                    return vtsEnRango.reduce((sum, v) => sum + Number(v.ventas_cerradas || 0) - Number(v.bajas || 0), 0);
                };

                // Calcular dias por semana
                let diasPorSemana = {};
                semanas.forEach(sem => {
                    let current = new Date(sem.fecha_inicio + 'T00:00:00');
                    let end = new Date(sem.fecha_fin + 'T00:00:00');
                    let dias = [];
                    while(current <= end) {
                        dias.push(current.toISOString().split('T')[0]); // YYYY-MM-DD
                        current.setDate(current.getDate() + 1);
                    }
                    diasPorSemana[sem.id] = dias;
                });

                let matrixHtml = '<table id="tabla-seguimiento"><thead><tr><th>SUCURSAL</th><th>ASESOR/A</th><th>EQUIPO</th>';
                semanas.forEach(sem => {
                    matrixHtml += '<th class="th-semana" style="cursor:pointer;" onclick="toggleSemana(\\''+sem.id+'\\')">' + sem.nombre_semana + ' <i id="icon-sem-'+sem.id+'" class="fa-solid fa-square-plus"></i><br><small>(Obj: ' + sem.objetivo + ')</small></th>';
                    // Crear THs ocultos para cada dia
                    let dNames = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
                    diasPorSemana[sem.id].forEach(dStr => {
                        let objD = new Date(dStr + 'T00:00:00');
                        matrixHtml += '<th class="day-col-'+sem.id+'" style="display:none; background:#d4c49d;">'+dNames[objD.getDay()]+'<br><small>'+dStr.substring(8,10)+'/'+dStr.substring(5,7)+'</small></th>';
                    });
                });
                matrixHtml += '<th class="th-totales">Ventas Totales</th><th class="th-totales">Monto Vendido</th></tr></thead><tbody>';

                let totalesAgencia = { ventas: 0, monto: 0 };
                let currentAgenciaId = null;

                equipos.sort((a,b) => {
                    let nomA = agencias.find(x => x.id === a.agencia_id)?.nombre || '';
                    let nomB = agencias.find(x => x.id === b.agencia_id)?.nombre || '';
                    return nomA.localeCompare(nomB) || a.nombre.localeCompare(b.nombre);
                });

                equipos.forEach(eq => {
                    let agencia = agencias.find(a => a.id === eq.agencia_id);
                    let nombreAgencia = agencia ? agencia.nombre : 'Desconocida';
                    
                    let vendsEquipo = perfiles.filter(p => p.equipo_id === eq.id && p.rol === 'Vendedor');
                    if(vendsEquipo.length === 0) return;

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
                        matrixHtml += '<td class="td-asesor" style="'+tdStyle+'">' + v.nombre + '</td>';
                        matrixHtml += '<td style="'+tdStyle+'">' + eq.nombre + '</td>';

                        semanas.forEach((sem, idx) => {
                            let vNetas = getVentasEnSemana(v.id, sem.fecha_inicio, sem.fecha_fin);
                            semTotals[idx] += vNetas;
                            
                            let colorClass = 'color-red';
                            if (sem.objetivo === 0) colorClass = '';
                            else if (vNetas >= sem.objetivo) colorClass = 'color-green';
                            else if (vNetas > 0) colorClass = 'color-yellow';
                            
                            matrixHtml += '<td class="obj-cell ' + colorClass + '" style="'+tdStyle+'">' + vNetas + '</td>';

                            // Celdas diarias
                            diasPorSemana[sem.id].forEach((dStr, dIdx) => {
                                let vDia = getVentasEnDia(v.id, dStr);
                                dayEqTotals[sem.id][dIdx] += vDia;
                                matrixHtml += '<td class="day-col-'+sem.id+'" style="display:none; '+tdStyle+' font-size:12px; color:#555;">' + (vDia > 0 ? vDia : '-') + '</td>';
                            });
                        });

                        matrixHtml += '<td style="font-weight:bold; ' + tdStyle + '">' + miTotalVentas + '</td>';
                        matrixHtml += '<td style="' + tdStyle + '">\$' + miTotalMonto.toLocaleString('es-AR') + '</td>';
                        matrixHtml += '</tr>';
                    });

                    // Fila Total Equipo
                    matrixHtml += '<tr class="row-equipo-total">';
                    matrixHtml += '<td colspan="3" style="text-align:center; ' + tdStyle + ' border-top:none;">TOTAL EQUIPO ' + eq.nombre.toUpperCase() + '</td>';
                    semanas.forEach((sem, idx) => {
                        matrixHtml += '<td style="' + tdStyle + ' border-top:none;">' + semTotals[idx] + '</td>';
                        diasPorSemana[sem.id].forEach((dStr, dIdx) => {
                             let vTot = dayEqTotals[sem.id][dIdx];
                             matrixHtml += '<td class="day-col-'+sem.id+'" style="display:none; '+tdStyle+' border-top:none; font-size:12px; color:#ccc;">' + (vTot > 0 ? vTot : '-') + '</td>';
                        });
                    });
                    matrixHtml += '<td style="' + tdStyle + ' border-top:none;">' + totalEqVentas + '</td>';
                    matrixHtml += '<td style="' + tdStyle + ' border-top:none;">\$' + totalEqMonto.toLocaleString('es-AR') + '</td>';
                    matrixHtml += '</tr>';
                });

                matrixHtml += '</tbody></table>';
                document.getElementById('contenedor-tabla').innerHTML = matrixHtml;

            } catch (err) {
                document.getElementById('contenedor-tabla').innerHTML = '<div style="color:red; text-align:center; padding:50px;">ERROR: ' + err.message + '</div>';
            }
        }

        
        window.toggleSemana = function(id) {
            let cols = document.querySelectorAll('.day-col-' + id);
            let icon = document.getElementById('icon-sem-' + id);
            let isHidden = cols[0].style.display === 'none';
            cols.forEach(c => c.style.display = isHidden ? 'table-cell' : 'none');
            if(icon) {
                icon.className = isHidden ? 'fa-solid fa-square-minus' : 'fa-solid fa-square-plus';
            }
        };

        window.onload = cargarData;

    