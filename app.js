const express = require('express');
const app = express();
const moment = require("moment");
const port = 3013;
const bodyParser = require("body-parser");
const formData = require("express-form-data");
const cors = require("cors");


app.use(formData.parse());
app.use(bodyParser.urlencoded({extended : true}));
app.use(express.json({extended : true}));



app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

var corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200 
};

app.use(express.static('uploads'));
app.use(cors(corsOptions));

require('./rotas/fornecedores')(app);
require('./rotas/clientes')(app);


console.log("Teste");

app.get('/', function (req, res) {
  res.send('Backend Rafael Adolfo rodando...');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
