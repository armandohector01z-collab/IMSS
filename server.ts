import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import sql from 'mssql';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// Configuración de Azure SQL
const sqlConfig: sql.config = {
  user: process.env.AZURE_SQL_USER,
  password: process.env.AZURE_SQL_PASSWORD,
  database: process.env.AZURE_SQL_DATABASE,
  server: process.env.AZURE_SQL_SERVER || '',
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: true, // Para Azure
    trustServerCertificate: false // Cambiar a true para desarrollo local si es necesario
  }
};

const poolPromise = new sql.ConnectionPool(sqlConfig)
  .connect()
  .then(pool => {
    console.log('Connected to Azure SQL Database');
    return pool;
  })
  .catch(err => {
    console.error('Database Connection Failed! Bad Config: ', err);
    throw err;
  });

app.use(express.json());

// API: Login
app.post('/api/login', async (req, res) => {
  try {
    const { nss } = req.body;
    const pool = await poolPromise;
    const result = await pool.request()
      .input('nss', sql.Int, nss)
      .query('SELECT * FROM Paciente WHERE NSS = @nss');
    
    if (result.recordset.length > 0) {
      res.json({ success: true, user: result.recordset[0] });
    } else {
      res.status(401).json({ success: false, message: 'NSS no encontrado' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// API: Get Patient Data
app.get('/api/patient/:nss/dashboard', async (req, res) => {
  try {
    const { nss } = req.params;
    const pool = await poolPromise;

    // Obtener Paciente
    const userResult = await pool.request()
      .input('nss', sql.Int, nss)
      .query('SELECT * FROM Paciente WHERE NSS = @nss');
    
    if (userResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Paciente no encontrado' });
    }
    const user = userResult.recordset[0];

    // Citas
    const appointmentsResult = await pool.request()
      .input('nss', sql.Int, nss)
      .query(`
        SELECT c.*, um.Nombre as UnidadNombre 
        FROM Cita c
        JOIN UnidadMedica um ON c.id_unidad = um.id_unidad
        WHERE c.NSS = @nss
        ORDER BY c.fecha_hora DESC
      `);
    const appointments = appointmentsResult.recordset;

    // Historial (Simplificado basándose en el esquema anterior)
    const recordsResult = await pool.request()
      .input('nss', sql.Int, nss)
      .query(`
        SELECT 
          con.fecha_hora, 
          m.especialidad, 
          m.primer_nombre + ' ' + m.primer_apellido as medico,
          d.padecimientos as status
        FROM Consulta con
        JOIN Medico m ON con.Matricula = m.Matricula
        JOIN Diagnostico d ON con.id_consulta = d.id_consulta
        JOIN Cita ci ON con.fecha_hora = ci.fecha_hora AND con.id_consultorio = ci.id_consultorio
        WHERE ci.NSS = @nss
      `);
    const records = recordsResult.recordset;

    // Recetas
    const prescriptionsResult = await pool.request()
      .input('nss', sql.Int, nss)
      .query(`
        SELECT r.id_receta, m.nombre as medicamento, t.dosis, t.frecuencia, t.duracion
        FROM Receta r
        JOIN Consulta con ON r.id_receta = con.id_receta
        JOIN Cita ci ON con.fecha_hora = ci.fecha_hora AND con.id_consultorio = ci.id_consultorio
        JOIN Tiene t ON r.id_receta = t.id_receta
        JOIN Medicamento m ON t.id_medicamento = m.id_medicamento
        WHERE ci.NSS = @nss
      `);
    const prescriptions = prescriptionsResult.recordset;

    res.json({
      user,
      appointments,
      records,
      prescriptions
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al recuperar datos del dashboard' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
