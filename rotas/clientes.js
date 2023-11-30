const express = require("express");
const moment = require("moment");
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const path = require('path');

const fs= require("fs");  //da uma olhada na documentação no npm.



const connection = require("../config/database");

  

module.exports = (app)=>{
    const rotas = express.Router();

    rotas.get("/novarota", (req,res) =>{
        res.send("Nova rota para clientes");
    });
    
    app.get('/clientes', (req, res) => {
        connection.query(
          'select * from cliente',
          (err, results, fields) => {
            if(err) console.log(err)
            res.send(results)
          }
        );
      });
     
      rotas.get('/clientes_all',  (req, res) => {
        connection.query(
          'select * from cliente order by id_cliente desc limit 10 ',
          (err, results, fields) => {
            if(err) console.log(err)
            res.send(results)
          }
        );
      })

      app.get('/uploads/clientes/:imageName', (req, res) => {
        const imageName = req.params.imageName;
        const imagePath = path.join(__dirname, '../uploads/clientes', imageName);
        res.sendFile(imagePath);
      });

      rotas.get('/clientes_byid/:id_cliente', (req, res) => {
        var id_cliente = req.params.id_cliente 
        connection.query(
          `select * from cliente where id_cliente = ${id_cliente}`,
          (err, results, fields) => {
            if(err) console.log(err)
            console.log(results)
            var resultado = {}
            if(results.length > 0){
              resultado.id_cliente = results[0].id_cliente
              resultado.nome = results[0].nome
              resultado.sobrenome = results[0].sobrenome
              resultado.email = results[0].email
              resultado.salario = results[0].salario
              resultado.data_cadastro = results[0].data_cadastro
            }
            
            res.send(resultado)
          }
        );
      })
      rotas.get('/clientes_email/:email', (req, res) => {
        var email = req.params.email 
        var sql =  `select * from cliente where email = "${email}"`
        connection.query(
          sql,
          (err, results, fields) => {
            if(err) console.log(err)
            console.log(results)
            if(results.length > 0) res.send({existe : true})
            else res.send({existe : false})
          }
        );
      })
      rotas.get('/clientes_nome/:nome', (req, res) => {
        var nome = req.params.nome;
        var sql = `select * from cliente where nome = "${nome}"`;
        
        connection.query(
            sql,
            (err, results, fields) => {
                if (err) {
                    console.log(err);
                    res.status(500).send({ erro: 'Erro no servidor' });
                    return;
                }
    
                console.log(results);
    
                if (results.length > 0) {
                    res.send({ existe: true, cliente: results[0] });
                } else {
                    res.send({ existe: false });
                }
            }
        );
    });
    

      app.post('/clientes',(req,res)=>{
        var nome = req.body.nome
        var sobrenome = req.body.sobrenome
        var email = req.body.email
        var data_cadastro = moment().format("YYYY-MM-DD")
        var salario = req.body.salario
        console.log(req.files)
        var sql =`insert into cliente (nome, sobrenome, email, `+
        `data_cadastro, salario) values("${nome}", "${sobrenome}", `+
        `"${email}","${data_cadastro}","${salario}")`
    
       
        connection.query(sql, (erro, resultado)=>{
          var caminhoTemp =req.files.avatar.path;
          var caminhoFinal = `./uploads/clientes/${resultado.insertId}.png`;
      
          if(erro) res.send(erro)
          fs.copyFile(caminhoTemp,caminhoFinal,
          (err)=>{
            console.log(err);
          })
          res.send(resultado)
        });
      });

      rotas.post('/clientes_del/:id_cliente', (req, res) => {
        var id_cliente = req.params.id_cliente 
        connection.query(
          `delete from cliente where id_cliente = ${id_cliente}`,
          (err, results, fields) => {
            if(err) console.log(err)
            res.send(results)
          }
        );
      })
      
      rotas.post('/clientes', upload.single('avatar'),(req,res)=>{
        var nome = req.body.nome
        var sobrenome = req.body.sobrenome
        var email = req.body.email
        var data_cadastro = moment().format("YYYY-MM-DD")
        var salario = req.body.salario
        console.log(req.files)
        var sql =`insert into cliente (nome, sobrenome, email, `+
        `data_cadastro, salario) values("${nome}", "${sobrenome}", `+
        `"${email}","${data_cadastro}","${salario}")`
    
       
        connection.query(sql, (erro, resultado)=>{
          var caminhoTemp =req.files.avatar.path;
          var caminhoFinal = `./uploads/clientes/${resultado.insertId}.png`;
      
          if(erro) res.send(erro)
          fs.copyFile(caminhoTemp,caminhoFinal,
          (err)=>{
            console.log(err);
          })
          res.send(resultado)
        });
      });

      app.patch('/clientes_byid/:id_cliente', (req, res) => {
        const idCliente = req.params.id_cliente;
        var nome = req.body.nome;
        var sobrenome = req.body.sobrenome;
        var email = req.body.email;
        var salario = req.body.salario;
      
        var sql = `UPDATE cliente SET nome=?, sobrenome=?, email=?, salario=? WHERE id_cliente = ?`;
        connection.query(sql, [nome, sobrenome, email, salario, idCliente], (error, result) => {
          if (error) {
            console.error('Erro ao atualizar o cliente:', error);
            res.status(500).json({ error: 'Erro ao atualizar o cliente.' });
          } else {
            if (req.files && req.files.avatar) {
              const caminhoTemp = req.files.avatar.path;
              const caminhoFinal = `./uploads/clientes/${idCliente}.png`;
      
              fs.copyFile(caminhoTemp, caminhoFinal, (err) => {
                if (err) {
                  console.error('Erro ao copiar o arquivo de imagem:', err);
                  res.status(500).json({ error: 'Erro ao atualizar o cliente.' });
                } else {
                  console.log('Arquivo de imagem copiado com sucesso.');
                }
              });
            }
            console.log(sql);
            console.log('Cliente atualizado com sucesso.',);
            res.status(200).json({ message: 'Cliente atualizado com sucesso.' });
          }
        });
      });
      rotas.patch('/clientes/:id_cliente', (req, res) => {
        const idCliente = req.params.id_cliente;
        var nome = req.body.nome;
        var sobrenome = req.body.sobrenome;
        var email = req.body.email;
        var salario = req.body.salario;
      
        var sql = `UPDATE cliente SET nome=?, sobrenome=?, email=?, salario=? WHERE id_cliente = ?`;
        connection.query(sql, [nome, sobrenome, email, salario, idCliente], (error, result) => {
          if (error) {
            console.error('Erro ao atualizar o cliente:', error);
            res.status(500).json({ error: 'Erro ao atualizar o cliente.' });
          } else {
            console.log(sql);
            console.log('Cliente atualizado com sucesso.',);
            res.status(200).json({ message: 'Cliente atualizado com sucesso.' });
          }
        });
      });
      
      
      app.delete('/clientes/:id_cliente', (req, res) => {
        const idCliente = req.params.id_cliente;
      
        const sql = `DELETE FROM cliente WHERE id_cliente = ?`;
        connection.query(sql, [idCliente], (error, result) => {
          if (error) {
            console.error('Erro ao excluir o cliente:', error);
            res.status(500).json({ error: 'Erro ao excluir o cliente.' });
          } else {
            console.log('Cliente excluído com sucesso.');
            res.status(200).json({ message: 'Cliente excluído com sucesso.' });
          }
        });
      });    

      

    app.use("/",rotas);
};