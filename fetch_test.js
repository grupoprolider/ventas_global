async function fetchRow() {
    const res = await fetch('https://pumpwqyazqaxeeknrhyo.supabase.co/rest/v1/perfiles?limit=1', {
        headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1bXB3cXlhenFheGVla25yaHlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MjQ4ODEsImV4cCI6MjA5NDIwMDg4MX0.-AQZZYAt-uskDLUpbiafJXbHgW0lErf8bwEnk7eq1DE'
        }
    });
    const data = await res.json();
    console.log(data);
}
fetchRow();
