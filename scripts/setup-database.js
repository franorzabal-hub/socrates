const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = 'https://mdbupwurfbqcxyuxcnum.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kYnVwd3VyZmJxY3h5dXhjbnVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Nzk3Mjc3MywiZXhwIjoyMDczNTQ4NzczfQ.iVdG5Dsgx55TrhGyoMj4jzymcwB8vrp0kXzO05qKbTE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log('Setting up database schema...');

  try {
    // Read the SQL schema file
    const schemaPath = path.join(__dirname, '..', 'supabase', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split by semicolons and execute each statement
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      console.log('Executing:', statement.substring(0, 50) + '...');

      const { error } = await supabase.rpc('exec_sql', {
        sql: statement + ';'
      }).single();

      if (error) {
        console.error('Error executing statement:', error);
        // Continue with other statements even if one fails
      }
    }

    console.log('Database schema setup complete!');
  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();