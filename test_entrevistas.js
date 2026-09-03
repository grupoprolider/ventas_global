const { createClient } = require('@supabase/supabase-js');
const clienteSupabase = createClient('https://pumpwqyazqaxeeknrhyo.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1bXB3cXlhenFheGVla25yaHlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MjQ4ODEsImV4cCI6MjA5NDIwMDg4MX0.-AQZZYAt-uskDLUpbiafJXbHgW0lErf8bwEnk7eq1DE');

async function test() {
    try {
        const hoyLocal = new Date();
        hoyLocal.setHours(0, 0, 0, 0);
        const isoMidnight = hoyLocal.toISOString();
        
        const [{ data: entrevistas, error }] = await Promise.all([
            clienteSupabase.from('registro_entrevistas').select('vendedor_id, created_at').gte('created_at', isoMidnight)
        ]);
        console.log("Success. Error:", error);
    } catch(err) {
        console.error("FAIL:", err);
    }
}
test();
