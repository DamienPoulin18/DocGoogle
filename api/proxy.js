const axios = require('axios');

module.exports = async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).send("URL manquante");

    try {
        const targetUrl = url.startsWith('http') ? url : `https://${url}`;
        const response = await axios.get(targetUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
            responseType: 'text'
        });

        let html = response.data;
        const origin = new URL(targetUrl).origin;

        // RÉÉCRITURE DES LIENS : On force tout à repasser par ton API Vercel
        // Remplace les liens relatifs et absolus par : /api/proxy?url=...
        html = html.replace(/(href|src)="(?!http)([^"]+)"/g, `$1="${origin}$2"`);
        html = html.replace(/(href|src)="((http|https)[^"]+)"/g, (match, p1, p2) => {
            return `${p1}="/api/proxy?url=${encodeURIComponent(p2)}"`;
        });

        // Injection d'un petit script pour corriger les formulaires de recherche
        html += `
            <script>
                document.querySelectorAll('form').forEach(f => {
                    f.addEventListener('submit', e => {
                        e.preventDefault();
                        const target = f.action || window.location.href;
                        const data = new URLSearchParams(new FormData(f)).toString();
                        window.location.href = '/api/proxy?url=' + encodeURIComponent(target + '?' + data);
                    });
                });
            </script>`;

        res.setHeader('Content-Type', 'text/html');
        res.status(200).send(html);
    } catch (error) {
        res.status(500).send("Erreur de relais : " + error.message);
    }
};
