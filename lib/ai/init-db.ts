import { supabase } from '../supabaseClient';
import fs from 'fs';
import path from 'path';

/**
 * Initialize the database by running the SQL setup script
 * This should be run once to set up the vector database
 */
export async function initializeDatabase(): Promise<boolean> {
  try {
    console.log('Initializing vector database...');

    // Read the SQL setup file
    const sqlPath = path.join(process.cwd(), 'lib', 'ai', 'supabase-setup.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Split SQL commands by semicolon and execute them one by one
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    for (const command of commands) {
      if (command.trim()) {
        try {
          const { error } = await supabase.rpc('exec_sql', {
            sql: command + ';'
          });

          if (error && !error.message.includes('already exists')) {
            console.warn(`Warning executing command: ${error.message}`);
            console.warn(`Command was: ${command.substring(0, 100)}...`);
          }
        } catch (err) {
          console.warn(`Warning with command: ${err}`);
          // Continue with other commands
        }
      }
    }

    // Test the setup by running a simple query
    const { data: testData, error: testError } = await supabase
      .from('blog_chunks')
      .select('count(*)', { count: 'exact' });

    if (testError) {
      console.error('Error testing database setup:', testError);
      return false;
    }

    console.log('✅ Vector database initialized successfully');
    console.log(`📊 Current chunks in database: ${(testData as any)?.length || 0}`);
    return true;
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    return false;
  }
}

/**
 * Test the vector search functionality
 */
export async function testVectorSearch(): Promise<boolean> {
  try {
    // Create a test embedding (dummy data)
    const testEmbedding = Array(1536).fill(0).map(() => Math.random() * 0.1);

    const { data, error } = await supabase.rpc('search_blog_chunks', {
      query_embedding: JSON.stringify(testEmbedding),
      match_threshold: 0.1,
      match_count: 3
    });

    if (error) {
      console.error('Error testing vector search:', error);
      return false;
    }

    console.log('✅ Vector search test successful');
    console.log(`📊 Found ${data?.length || 0} test results`);
    return true;
  } catch (error) {
    console.error('❌ Error testing vector search:', error);
    return false;
  }
}

// Export for use in scripts
if (require.main === module) {
  initializeDatabase()
    .then(success => {
      if (success) {
        return testVectorSearch();
      }
      return false;
    })
    .then(success => {
      process.exit(success ? 0 : 1);
    });
}