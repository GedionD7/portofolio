const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(express.static('.'));

// Supabase setup - REPLACE WITH YOUR ACTUAL CREDENTIALS
const supabaseUrl = 'https://fffmvhjitlnyzeirtguj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmZm12aGppdGxueXplaXJ0Z3VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NTUwNTUsImV4cCI6MjA3MjMzMTA1NX0.g_Mw3_Es6Kl4M64b9QOKT5_2EwNnn-0vJZSMf3QQeYo';
const supabase = createClient(supabaseUrl, supabaseKey);

// Handle form submissions
app.post('/submit-question', async (req, res) => {
  try {
    const { name, email, question } = req.body;
    
    const { data, error } = await supabase
      .from('questions')
      .insert([{ name, email, question }]);

    if (error) {
      console.error('Supabase error:', error);
      res.status(500).json({ success: false, message: 'Database error' });
    } else {
      console.log('Question saved to Supabase');
      res.json({ success: true, message: 'Question submitted successfully!' });
    }
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// SECURE Admin page with password
app.get('/admin', async (req, res) => {
  const password = req.query.password;
  
  if (password !== 'Tsion!') {
    return res.status(401).send('<h1>🔒 Access Denied</h1><p>Contact administrator</p>');
  }
  
  try {
    const { data: questions, error } = await supabase
      .from('questions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      res.status(500).send('Database error');
    } else {
      let html = '<h1>Submitted Questions</h1><table border=1><tr><th>Name</th><th>Email</th><th>Question</th><th>Date</th></tr>';
      questions.forEach(row => {
        html += `<tr><td>${row.name}</td><td>${row.email}</td><td>${row.question}</td><td>${new Date(row.created_at).toLocaleString()}</td></tr>`;
      });
      res.send(html + '</table>');
    }
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'portfolio.html'));
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log('🔒 Admin: /admin?password=Tsion!');
});
