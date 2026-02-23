const axios = require('axios');

module.exports = async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send("URL manquante");

  try {
    const response = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(response.data);
  } catch (error) {
    res.status(500).send("Erreur d'accès au site : " + error.message);
  }
};
