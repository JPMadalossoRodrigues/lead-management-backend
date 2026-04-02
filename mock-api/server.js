const express = require('express');
const { companies } = require('./data/companies');

const app = express();

app.get('/enrichment/:cnpj', (req, res) => {
  const { cnpj } = req.params;

  const company = companies[cnpj];


  if (!company) {
    return res.status(404).json({
      message: 'Empresa não encontrada'
    });
  }

  res.json(company);
});

app.listen(3001, () => {

});