const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');


const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

// Conexión a la base de datos
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'fruteria',
});

connection.connect((err) => {
  if (err) {
    console.error('Error al conectar con la base de datos:', err);
    return;
  }
  console.log('Conexión establecida con la base de datos');
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//////////////////////////////////INICIO DE SESION//////////////////////////////////////
// Endpoint para manejar la solicitud de inicio de sesión
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const sql = 'SELECT * FROM login WHERE username = ? AND password = ?';
  connection.query(sql, [username, password], (err, result) => {
    if (err) {
      console.error('Error en la consulta de inicio de sesión:', err);
      res.status(500).json({ success: false, message: 'Error en la base de datos' });
      return;
    }

    if (result.length > 0) {
      res.json({ success: true, message: 'Inicio de sesión exitoso', username: username });
    } else {
      res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
    }
  });
});


////////////////////////////////USUARIOS/////////////////////////////////////////////

// Endpoint para manejar la solicitud de creación de usuarios
app.post('/crearusuarios', (req, res) => {
  const { username, password } = req.body;
  const sql = 'INSERT INTO login (username, password) VALUES (?, ?)';
  connection.query(sql, [username, password], (err, result) => {
    if (err) {
      console.error('Error al crear usuario:', err);
      res.status(500).json({ success: false, message: 'Error al crear usuario' });
      return;
    }
    console.log('Usuario creado exitosamente:', username);
    res.status(201).json({ success: true, message: 'Usuario creado correctamente' });
  });
});


// Endpoint para obtener la lista de usuarios
app.get('/getusuarios', (req, res) => {
  const sql = 'SELECT id, username, password FROM login';
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error al obtener usuarios:', err);
      res.status(500).json({ success: false, message: 'Error al obtener usuarios' });
      return;
    }
    console.log('Usuarios obtenidos exitosamente');
    res.status(200).json(results);
  });
});


// Endpoint para editar un usuario
app.put('/editarusuario/:id', (req, res) => {
  const sql = "UPDATE login SET username=?, password=? WHERE id = ?";
  const values = [
      req.body.nombreusuario,
      req.body.contra,
      req.params.id
  ];
  connection.query(sql, values, (err, data) => {
      if (err) return res.json(err);
      return res.json(data);
  });
});



// Endpoint para eliminar un usuario
app.delete('/eliminarusuario/:id', (req, res) => {
  const sql = "DELETE FROM login WHERE id = ?";
  const id = req.params.id;
  connection.query(sql, [id], (err, data) => {
      if (err) return res.json(err);
      return res.json(data);
  });
});




///////////////////////////PROMOCIONES/////////////////////////////////////

// Endpoint para obtener todas las promociones con la imagen en base64
app.get('/promociones', (req, res) => {
  connection.query('SELECT id, nombre, descripcion, precio, categoria_id, imagen FROM promociones', (err, result) => {
    if (err) {
      res.status(500).json({ success: false, message: 'Error en la base de datos' });
      return;
    }
    // Convertir Blob a base64
    const promociones = result.map(promocion => ({
      ...promocion,
      imagen: promocion.imagen.toString('base64')
    }));

    res.json({ success: true, promociones });
  });
});

// Endpoint para insertar una promoción
app.post('/promociones', upload.single('imagen'), (req, res) => {
  try {
    if (!req.file) {
      throw new Error('No se proporcionó ninguna imagen.');
    }

    const { nombre, descripcion, precio, categoria_id } = req.body;

    connection.query(
      'INSERT INTO promociones (nombre, descripcion, precio, imagen, categoria_id) VALUES (?, ?, ?, ?, ?)',
      [nombre, descripcion, precio, req.file.buffer, categoria_id],
      (err, result) => {
        if (err) {
          throw err;
        }

        res.json({ success: true, message: 'Promoción cargada e insertada con éxito' });
      }
    );
  } catch (error) {
    console.error('Error en la carga de promociones:', error.message);
    res.json({ success: false, error: error.message });
  }
});

// Endpoint para editar una promoción
app.put('/promociones/:id', upload.single('imagen'), (req, res) => {
  try {
    const promocionId = req.params.id;
    
    const { nombre, descripcion, precio, categoria_id } = req.body;

    const updateQuery = 'UPDATE promociones SET nombre = ?, descripcion = ?, precio = ?, categoria_id = ?' +
    (req.file ? ', imagen = ?' : '') + 
    ' WHERE id = ?';

    const queryParams = [nombre, descripcion, precio, categoria_id];
    if (req.file) {
      queryParams.push(req.file.buffer);
    }
    queryParams.push(promocionId); 
    connection.query(updateQuery, queryParams, (err, result) => {
      if (err) {
        throw err;
      }

      if (result.affectedRows === 0) {
        throw new Error('No se encontró ninguna promoción con el ID proporcionado');
      }

      res.json({ success: true, message: 'Promoción actualizada con éxito' });
    });
  } catch (error) {
    console.error('Error al editar la promoción:', error.message);
    res.json({ success: false, error: error.message });
  }
});


// Endpoint para eliminar una promoción por ID
app.delete('/promociones/:id', (req, res) => {
  const id = req.params.id;
  connection.query('DELETE FROM promociones WHERE id = ?', id, (err, result) => {
    if (err) {
      console.error('Error al eliminar la promoción:', err);
      res.status(500).json({ error: 'Error al eliminar la promoción' });
      return;
    }
    res.json({ message: 'Promoción eliminada exitosamente' });
  });
});


////////////////////////////////////PROMOCIONES POR ID FRUTAS//////////////////////////////////////////////////////

// Endpoint para obtener todas las promociones de frutas (categoria_id = 1)
app.get('/promociones/categoria/1', (req, res) => {
  db.query('SELECT * FROM promociones WHERE categoria_id = 1', (err, result) => {
    if (err) {
      console.error('Error al obtener promociones de frutas:', err);
      res.status(500).send('Error al obtener promociones de frutas');
      return;
    }
    res.json({ promociones: result });
  });
});

// Endpoint para obtener una promoción de fruta por ID
app.get('/promociones/frutas/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const fruta = promociones.find(promocion => promocion.id === id && promocion.categoria_id === 1);
  if (fruta) {
    res.json({ promocion: fruta });
  } else {
    res.status(404).json({ error: 'Promoción de fruta no encontrada' });
  }
});


//////////////////////////////////VERDURAS ////////////////////////////////

// Endpoint para obtener todas las promociones de verduras
app.get('/promociones/categoria/2', (req, res) => {
  db.query('SELECT * FROM promociones WHERE categoria_id = 2', (err, result) => {
    if (err) {
      console.error('Error al obtener promociones de verduras:', err);
      res.status(500).send('Error al obtener promociones de verduras');
      return;
    }
    res.json({ promociones: result });
  });
});

// Endpoint para obtener una promoción de verdura por ID
app.get('/promociones/verduras/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const verdura = promociones.find(promocion => promocion.id === id && promocion.categoria_id === 2);
  if (verdura) {
    res.json({ promocion: verdura });
  } else {
    res.status(404).json({ error: 'Promoción de verdura no encontrada' });
  }
});

///////////////////////////////LACTEOS////////////////////////////////

// Endpoint para obtener todas las promociones de lacteos
app.get('/promociones/categoria/3', (req, res) => {
  db.query('SELECT * FROM promociones WHERE categoria_id = 3', (err, result) => {
    if (err) {
      console.error('Error al obtener promociones de lacteos:', err);
      res.status(500).send('Error al obtener promociones de lacteos');
      return;
    }
    res.json({ promociones: result });
  });
});

// Endpoint para obtener una promoción de lacteos por ID
app.get('/promociones/lacteos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const lacteo = promociones.find(promocion => promocion.id === id && promocion.categoria_id === 3);
  if (lacteo) {
    res.json({ promocion: lacteo });
  } else {
    res.status(404).json({ error: 'Promoción de lacteos no encontrada' });
  }
});
/////////////////////////////BOTANAS////////////////////////

// Endpoint para obtener todas las promociones de botanas
app.get('/promociones/categoria/4', (req, res) => {
  db.query('SELECT * FROM promociones WHERE categoria_id = 4', (err, result) => {
    if (err) {
      console.error('Error al obtener promociones de botanas:', err);
      res.status(500).send('Error al obtener promociones de botanas');
      return;
    }
    res.json({ promociones: result });
  });
});

// Endpoint para obtener una promoción de botanas por ID
app.get('/promociones/botanas/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const botana = promociones.find(promocion => promocion.id === id && promocion.categoria_id === 4);
  if (botana) {
    res.json({ promocion: botana });
  } else {
    res.status(404).json({ error: 'Promoción de botanas no encontrada' });
  }
});

////////////////////////////CEREALES///////////

// Endpoint para obtener todas las promociones de cereales
app.get('/promociones/categoria/5', (req, res) => {
  db.query('SELECT * FROM promociones WHERE categoria_id = 5', (err, result) => {
    if (err) {
      console.error('Error al obtener promociones de cereales:', err);
      res.status(500).send('Error al obtener promociones de cereales');
      return;
    }
    res.json({ promociones: result });
  });
});

// Endpoint para obtener una promoción de cereales por ID
app.get('/promociones/cereales/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const cereal = promociones.find(promocion => promocion.id === id && promocion.categoria_id === 5);
  if (cereal) {
    res.json({ promocion: cereal });
  } else {
    res.status(404).json({ error: 'Promoción de cereales no encontrada' });
  }
});

////////////////////////////////BEBIDAS////////////////

// Endpoint para obtener todas las promociones de bebidas
app.get('/promociones/categoria/6', (req, res) => {
  db.query('SELECT * FROM promociones WHERE categoria_id = 6', (err, result) => {
    if (err) {
      console.error('Error al obtener promociones de bebidas:', err);
      res.status(500).send('Error al obtener promociones de bebidas');
      return;
    }
    res.json({ promociones: result });
  });
});

// Endpoint para obtener una promoción de bebidas por ID
app.get('/promociones/bebidas/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const bebida = promociones.find(promocion => promocion.id === id && promocion.categoria_id === 6);
  if (bebida) {
    res.json({ promocion: bebida });
  } else {
    res.status(404).json({ error: 'Promoción de cereales no encontrada' });
  }
});

/////////////////////////CARNES/////////////////

// Endpoint para obtener todas las promociones de carnes
app.get('/promociones/categoria/7', (req, res) => {
  db.query('SELECT * FROM promociones WHERE categoria_id = 7', (err, result) => {
    if (err) {
      console.error('Error al obtener promociones de carnes:', err);
      res.status(500).send('Error al obtener promociones de carnes');
      return;
    }
    res.json({ promociones: result });
  });
});

// Endpoint para obtener una promoción de carnes por ID
app.get('/promociones/carnes/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const carne = promociones.find(promocion => promocion.id === id && promocion.categoria_id === 7);
  if (carne) {
    res.json({ promocion: carne });
  } else {
    res.status(404).json({ error: 'Promoción de carnes no encontrada' });
  }
});

/////////////////////////HIGIENE Y BELLEZA////////////

// Endpoint para obtener todas las promociones de higienebelleza
app.get('/promociones/categoria/8', (req, res) => {
  db.query('SELECT * FROM promociones WHERE categoria_id = 8', (err, result) => {
    if (err) {
      console.error('Error al obtener promociones de higiene y belleza:', err);
      res.status(500).send('Error al obtener promociones de higiene y belleza');
      return;
    }
    res.json({ promociones: result });
  });
});

// Endpoint para obtener una promoción de higienebelleza por ID
app.get('/promociones/higienebelleza/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const higienebelleza = promociones.find(promocion => promocion.id === id && promocion.categoria_id === 8);
  if (higienebelleza) {
    res.json({ promocion: higienebelleza });
  } else {
    res.status(404).json({ error: 'Promoción de higiene y belleza no encontrada' });
  }
});


//////////////////LIMPIEZA Y JARCIERIA///////////////

// Endpoint para obtener todas las promociones de limpieza y jarciería
app.get('/promociones/categoria/9', (req, res) => {
  db.query('SELECT * FROM promociones WHERE categoria_id = 9', (err, result) => {
    if (err) {
      console.error('Error al obtener promociones de limpieza y jarciería:', err);
      res.status(500).send('Error al obtener promociones de limpieza y jarciería');
      return;
    }
    res.json({ promociones: result });
  });
});

// Endpoint para obtener una promoción de limpieza y jarciería por ID
app.get('/promociones/limpiezajarcieria/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const limpiezaJarcieria = promociones.find(promocion => promocion.id === id && promocion.categoria_id === 9);
  if (limpiezaJarcieria) {
    res.json({ promocion: limpiezaJarcieria });
  } else {
    res.status(404).json({ error: 'Promoción de limpieza y jarciería no encontrada' });
  }
});

//////////////////////HARINA Y PAN//////////

// Endpoint para obtener todas las promociones de harina y pan
app.get('/promociones/categoria/10', (req, res) => {
  db.query('SELECT * FROM promociones WHERE categoria_id = 10', (err, result) => {
    if (err) {
      console.error('Error al obtener promociones de harina y pan:', err);
      res.status(500).send('Error al obtener promociones de harina y pan');
      return;
    }
    res.json({ promociones: result });
  });
});

// Endpoint para obtener una promoción de harina y pan por ID
app.get('/promociones/harinapan/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const harinapan = promociones.find(promocion => promocion.id === id && promocion.categoria_id === 10);
  if (harinapan) {
    res.json({ promocion: harinapan });
  } else {
    res.status(404).json({ error: 'Promoción de harina y pan no encontrada' });
  }
});

///////////////////ABARROTES/////////////////////


// Endpoint para obtener todas las promociones de abarrotes
app.get('/promociones/categoria/11', (req, res) => {
  db.query('SELECT * FROM promociones WHERE categoria_id = 11', (err, result) => {
    if (err) {
      console.error('Error al obtener promociones de abarrotes:', err);
      res.status(500).send('Error al obtener promociones de abarrotes');
      return;
    }
    res.json({ promociones: result });
  });
});

// Endpoint para obtener una promoción de abarrotes por ID
app.get('/promociones/abarrotes/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const abarrotes = promociones.find(promocion => promocion.id === id && promocion.categoria_id === 11);
  if (abarrotes) {
    res.json({ promocion: abarrotes });
  } else {
    res.status(404).json({ error: 'Promoción de abarrotes no encontrada' });
  }
});

////////////////////////////////////ENLATADOS///////////////

// Endpoint para obtener todas las promociones de enlatados
app.get('/promociones/categoria/12', (req, res) => {
  db.query('SELECT * FROM promociones WHERE categoria_id = 12', (err, result) => {
    if (err) {
      console.error('Error al obtener promociones de enlatados:', err);
      res.status(500).send('Error al obtener promociones de enlatados');
      return;
    }
    res.json({ promociones: result });
  });
});

// Endpoint para obtener una promoción de enlatados por ID
app.get('/promociones/enlatados/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const enlatado = promociones.find(promocion => promocion.id === id && promocion.categoria_id === 12);
  if (enlatado) {
    res.json({ promocion: enlatado });
  } else {
    res.status(404).json({ error: 'Promoción de enlatados no encontrada' });
  }
});


// Manejador de errores para rutas no encontradas
app.use((req, res) => {
  res.status(404).send('Endpoint no encontrado');
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
