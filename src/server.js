const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const validator = require('validator');

// CONFIG ----------------------------------------
var port = process.env.PORT || 3000;
const app = express();

app.use(bodyParser.urlencoded({ extender: false }));
app.use(bodyParser.json());

var connection = mysql.createConnection({
    host: 'db4free.net',
    user: 'lucas85235',
    password: 'lucas85632',
    database: 'nodelogin',
    port: 3306
});

connection.connect(function (err) {
    if (err) {
        console.log("Error connecting", err.stack)
        return;
    }
    console.log("Connected as id", connection.threadId)
});

// GET -------------------------------------------
// Raiz
app.get('/', (req, res) => {
    console.log('Passando no: Entrando no GET/');
    res.send('Welcome!');
})

// Login
app.get('/login/:email/:password', (req, res) => {
    console.log('Passando no: Entrando no GET/LOGIN');

    var error = false;
    var msg_res = {};
    msg_res.status = 200;
    msg_res.message = "";

    var login_temp = {};
    login_temp.email = req.params.email;
    login_temp.password = req.params.password;

    // console.log(login_temp);
    // console.log(msg_res);

    if (!validator.isEmail(login_temp.email)) {
        msg_res.status = 400;
        msg_res.message = "Invalid e-mail format";
        error = true;
    }

    if (!error) {
        login_select(login_temp)
            .then((result) => {
                console.log('login_select.then');

                if (parseInt(result.length) == 0) {
                    console.log('login_select.then.check result = 0');
                    msg_res.status = 400;
                    msg_res.message = "Login or password incorrect, check data!"
                }
                if (parseInt(result.length) > 1) {
                    console.log('login_select.then.check result > 1');
                    msg_res.status = 400;
                    msg_res.message = "Exist a problem with your data, contact us!"
                }

                res.status(msg_res.status).json(msg_res);
            })
            .catch((err) => {
                console.log('login_select.catch');

                if (err) {
                    msg_res.status = err.status_code;
                    msg_res.message = err.msg_text;
                } else {
                    msg_res.status = 500;
                    msg_res.message = "Is not possible to execute action, try again later!";
                }

                res.status(msg_res.status).json(msg_res);
            });
    } else {
        res.status(msg_res.status).json(msg_res);
    }
});

// POST -------------------------------------------
// Register
app.post('/register', (req, res) => {
    console.log('Passando no: Entrando no GET/REGISTER');

    var error = false;
    var msg_res = {};
    msg_res.status = 200;
    msg_res.message = "";

    var register_temp = {};
    register_temp = req.body;

    // console.log(login_temp);
    // console.log(msg_res);

    if (!validator.isEmail(register_temp.email)) {
        msg_res.status = 400;
        msg_res.message = "Invalid e-mail format";
        error = true;
    }

    if (!error) {
        // Check if exist register email
        register_select(register_temp).then((result) => {
            if (result.length > 0) {
                console.log("register_select.then check result > 0");
                msg_res.status = 400;
                msg_res.message = "There is already an account for this email!";
                res.status(msg_res.status).json(msg_res);
            } else {
                register_insert(register_temp).then((result2) => {
                    console.log("register_insert.then");
                    res.status(msg_res.status).json(msg_res);
                }).catch((err2) => {
                    console.log("register_insert.catch");
                    msg_res.status = 400;
                    msg_res.message = "An error occurring on try register account!";
                    res.status(msg_res.status).json(msg_res);
                });
            }
        }).catch((err) => {
            console.log('login_select.catch');

            if (err) {
                msg_res.status = err.status_code;
                msg_res.message = err.msg_text;
            } else {
                msg_res.status = 500;
                msg_res.message = "Is not possible to execute action, try again later!";
            }

            res.status(msg_res.status).json(msg_res);
        });
    }
    else res.status(msg_res.status).json(msg_res);
});

// FUNCTIONS

function login_select(login_temp) {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT * FROM login WHERE email = '${login_temp.email}' AND password = '${login_temp.password}'`, function (err, results, field) {
            var obj_err = {};
            obj_err.msg_text = '--->> login_select - Não entrou no erro ainda';

            if (err) {
                console.log('Erro: login_select dentro da PROMISE', err);
                obj_err.status_code = 400;
                obj_err.msg_text = err;
                reject(obj_err);
            } else {
                console.log('Dentro da PROMISE -> Selecionado', results.length);
                resolve(results);
            }
        });
    });
}

function register_select(register_temp) {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT * FROM login WHERE email = '${register_temp.email}'`, function (err, results, field) {
            var obj_err = {};
            obj_err.msg_text = '--->> register_select - Não entrou no erro ainda';

            if (err) {
                console.log('Erro: register_select dentro da PROMISE', err);
                obj_err.status_code = 400;
                obj_err.msg_text = err;
                reject(obj_err);
            } else {
                console.log('Dentro da PROMISE -> Selecionado', results.length);
                resolve(results);
            }
        });
    });
}

function register_insert(register_temp) {
    return new Promise((resolve, reject) => {
        connection.query(`INSERT INTO login (email, password) VALUES ('${register_temp.email}', '${register_temp.password}')`, function (err, results, field) {
            var obj_err = {};
            obj_err.msg_text = '--->> register_insert - Não entrou no erro ainda';

            if (err) {
                console.log('Erro: register_insert dentro da PROMISE', err);
                obj_err.status_code = 400;
                obj_err.msg_text = err;
                reject(obj_err);
            } else {
                resolve(results);
            }
        });
    });
}

app.listen(port, () => {
    console.log(`Listering port ${port}`);
});