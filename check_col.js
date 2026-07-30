const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://pumpwqyazqaxeeknrhyo.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1bXB3cXlhenFheGVla25yaHlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MjQ4ODEsImV4cCI6MjA5NDIwMDg4MX0.-AQZZYAt-uskDLUpbiafJXbHgW0lErf8bwEnk7eq1DE');

supabase.from('historial_objetivos').select('*').then(r => {
    console.log("historial_objetivos count:", r.data.length);
    const dups = {};
    r.data.forEach(x => {
        let key = x.vendedor_id + '|' + x.campana;
        if(!dups[key]) dups[key] = [];
        dups[key].push(x);
    });
    Object.keys(dups).forEach(k => {
        if(dups[k].length > 1) {
            console.log("DUPLICATE:", k, dups[k]);
        }
    });
    
    supabase.from('perfiles').select('id, nombre, objetivo_campana').ilike('nombre', '%blanes%').then(r2 => {
        console.log("BLANES in perfiles:", r2.data);
        if(r2.data && r2.data.length > 0) {
            let b = r2.data[0];
            console.log("BLANES in historial:", r.data.filter(x => x.vendedor_id === b.id));
        }
    });
});
