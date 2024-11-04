const { Pool } = require('pg');

// PostgreSQL connection
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'Diesel13',
  port: 5432,
});

/**
 * Creates the database tables, if they do not already exist.
 */
async function createTable() {
    const queries = `
      CREATE TABLE IF NOT EXISTS Movies (
        movie_id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        release_year INT NOT NULL,
        genre VARCHAR(100) NOT NULL,
        director VARCHAR(255) NOT NULL
      );
  
      CREATE TABLE IF NOT EXISTS Customers (
        customer_id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20) NOT NULL
      );
  
      CREATE TABLE IF NOT EXISTS Rentals (
        rental_id SERIAL PRIMARY KEY,
        customer_id INT REFERENCES Customers(customer_id) ON DELETE CASCADE,
        movie_id INT REFERENCES Movies(movie_id),
        rental_date DATE NOT NULL,
        return_date DATE
      );
    `;
    await pool.query(queries);
}

/**
 * Inserts a new movie into the Movies table.
 * 
 * @param {string} title Title of the movie
 * @param {number} year Year the movie was released
 * @param {string} genre Genre of the movie
 * @param {string} director Director of the movie
 */
async function insertMovie(title, year, genre, director) {
  try {
    await pool.query(
      'INSERT INTO movies (title, release_year, genre, director) VALUES ($1, $2, $3, $4)',
      [title, year, genre, director]
    );
    console.log(`Movie '${title}' inserted successfully.`);
  } catch (err) {
    console.error('Error inserting movie:', err);
  }
}
/**
 * Prints all movies in the database to the console
 */
async function displayMovies() {
  const response = await pool.query('SELECT title, release_year, genre, director FROM Movies');
  
  console.log('Movies in the database:');
  
  response.rows.forEach(row => {
    console.log(`${row.title} (${row.release_year}) - Genre: ${row.genre}, Director: ${row.director}`);
  });
}

/**
 * Updates a customer's email address.
 * 
 * @param {number} customerId ID of the customer
 * @param {string} newEmail New email address of the customer
 */
async function updateCustomerEmail(customerId, newEmail) {
  const query = `
    UPDATE customers
    SET email = $1
    WHERE customer_id = $2;
  `;
  await pool.query(query, [newEmail, customerId]);
  console.log(`Customer ${customerId}'s email updated to ${newEmail}.`);
};

/**
 * Removes a customer from the database along with their rental history.
 * 
 * @param {number} customerId ID of the customer to remove
 */
async function removeCustomer(customerId) {
  const query = `
    DELETE FROM Customers 
    WHERE customer_id = $1;
  `;
  await pool.query(query, [customerId]);
  console.log(`Removed customer with ID ${customerId}`);
}

/**
 * Prints a help message to the console
 */
function printHelp() {
  console.log('Usage:');
  console.log('  insert <title> <year> <genre> <director> - Insert a movie');
  console.log('  show - Show all movies');
  console.log('  update <customer_id> <new_email> - Update a customer\'s email');
  console.log('  remove <customer_id> - Remove a customer from the database');
}

/**
 * Runs our CLI app to manage the movie rentals database
 */
async function runCLI() {
  await createTable();

  const args = process.argv.slice(2);
  switch (args[0]) {
    case 'insert':
      if (args.length !== 5) {
        printHelp();
        return;
      }
      try {
        await insertMovie(args[1], parseInt(args[2]), args[3], args[4]);
      } catch (error) {
        console.error('Error inserting movie:', error);
      }
      break;
    case 'show':
      await displayMovies();
      break;
    case 'update':
      if (args.length !== 3) {
        printHelp();
        return;
      }
      try {
        await updateCustomerEmail(parseInt(args[1]), args[2]);
      } catch (error) {
        console.error('Error updating email:', error);
      }
      break;
    case 'remove':
      if (args.length !== 2) {
        printHelp();
        return;
      }
      try {
        await removeCustomer(parseInt(args[1]));
      } catch (error) {
        console.error('Error removing customer:', error);
      }
      break;
    default:
      printHelp();
      break;
  }
};

runCLI();
