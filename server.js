const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Database setup
const db = new sqlite3.Database('./questions.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('✅ Connected to SQLite database.');
    db.run(`CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      question TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('Error creating table:', err);
      } else {
        console.log('✅ Questions table is ready.');
      }
    });
  }
});

// API route to handle form submissions
app.post('/submit-question', (req, res) => {
  const { name, email, question } = req.body;
  
  console.log('📩 Received question from:', name, email);
  
  db.run(
    `INSERT INTO questions (name, email, question) VALUES (?, ?, ?)`,
    [name, email, question],
    function(err) {
      if (err) {
        console.error('❌ Database error:', err.message);
        res.status(500).json({ success: false, message: 'Failed to submit question' });
      } else {
        console.log(`✅ Question inserted with ID: ${this.lastID}`);
        res.json({ success: true, message: 'Question submitted successfully!' });
      }
    }
  );
});

// Route to view all questions (for admin)
app.get('/admin', (req, res) => {
  const password = req.query.password;
  
  if (password !== 'Tsion') {
    return res.status(401).send('Unauthorized. Please contact administrator.');
  }

  db.all('SELECT * FROM questions ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// Simple admin page to view questions
app.get('/admin', (req, res) => {
  db.all('SELECT * FROM questions ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      res.status(500).send('Error reading database');
    } else {
      let html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Admin - Submitted Questions</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
            h1 { color: #333; }
            table { width: 100%; border-collapse: collapse; background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background: #0ea5e9; color: white; }
            tr:hover { background: #f0f0f0; }
          </style>
        </head>
        <body>
          <h1>📋 Submitted Questions (Total: ${rows.length})</h1>
          <table>
            <tr><th>ID</th><th>Name</th><th>Email</th><th>Question</th><th>Date</th></tr>
      `;
      
      rows.forEach(row => {
        html += `<tr>
          <td>${row.id}</td>
          <td>${row.name}</td>
          <td>${row.email}</td>
          <td>${row.question}</td>
          <td>${new Date(row.created_at).toLocaleString()}</td>
        </tr>`;
      });
      
      html += '</table></body></html>';
      res.send(html);
    }
  });
});

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'portfolio.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log('🌐 Open your portfolio with: Web Preview -> port 8080');
  console.log('📊 View questions at: /admin');
  console.log('❓ Submit questions using the "Ask Us" button');
});
