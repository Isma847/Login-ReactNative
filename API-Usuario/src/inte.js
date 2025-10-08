const http = require('http');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const saltRounds = 10; // Nivel de dificultad para el cifrado

const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'user'
});

connection.connect((err) => {
    if (err) {
        console.error('Error conectando a la base de datos: ' + err.stack);
        return;
    }
    console.log('Conectado a la base de datos como id ' + connection.threadId);
});

const server = http.createServer((req, res) => {
    
    // 1. Manejo de CORS (Permite conexiones desde Expo/Web)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', async () => { 
        let data;
        try {
            data = JSON.parse(body);
        } catch (e) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Error: Datos JSON inválidos.');
            return;
        }
        const { nombre, contraseña } = data; 

		// INSERTAR USUARIO
        if (req.method === 'POST' && req.url === '/insertar') {
            
            //Cifrar la contraseña ANTES de guardarla
            const hash = await bcrypt.hash(contraseña, saltRounds);
            //Insertar el nombre y el hash de la contraseña
            const sql = 'INSERT INTO usuario (nombre, contraseña) VALUES (?, ?)'; 
            
            connection.query(sql, [nombre, hash], (error, results) => {
                if (error) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    // Detalle: Podría ser un error de BD, nombre duplicado, etc.
                    res.end('Error al registrar usuario: ' + error.code); 
                    return;
                }
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end('Usuario registrado con éxito.');
            });
        }

		// LOG IN
        else if (req.method === 'POST' && req.url === '/login') {

            // Buscar el usuario y obtener solo el hash guardado
            const sql = 'SELECT contraseña FROM usuario WHERE nombre = ?';

            connection.query(sql, [nombre], async (error, results) => {
                if (error || results.length === 0) {
                    // 401: Usuario no encontrado o error en la BD
                    res.writeHead(401, { 'Content-Type': 'text/plain' });
                    res.end('Nombre de usuario o contraseña inválidos.');
                    return;
                }
                // Hash cifrado de la base de datos
                const hashGuardado = results[0].contraseña; 
                //Comparar la contraseña ingresada con el hash guardado
                const match = await bcrypt.compare(contraseña, hashGuardado);

                if (match) {
                    res.writeHead(200, { 'Content-Type': 'text/plain' });
                    res.end(`Inicio de sesión exitoso.`);
                } else {
                    res.writeHead(401, { 'Content-Type': 'text/plain' });
                    res.end('Nombre de usuario o contraseña inválidos.');
                }
            });
        }
		// ERROR
        else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Ruta no encontrada');
        }
    });
});

const port = 3000;
server.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
