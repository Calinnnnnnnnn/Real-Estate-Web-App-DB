# Real Estate Project

## Description
This project is a complete application for managing real estate listings. The application includes:
- **Frontend**: Developed using HTML, CSS, and JavaScript with Vite.js support.
- **Backend**: Built with Node.js, using a server configured in `server.cjs`.
- **Database**: MySQL, connected for managing users and real estate listings.

## Key Features
- Signup and login pages for users.
- Adding, editing, and deleting real estate listings.
- Viewing and filtering active listings.

## Setup

### 1. System Requirements
- Node.js (version 16 or later)
- MySQL (version 8 or later)
- NPM or Yarn

### 2. Installation
1. Clone this repository:
   ```bash
   git clone https://github.com/user/real-estate-project.git
   cd real-estate-project
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure the database:
   - Create a MySQL database named `Anunturi_imobiliare`.
   - Import the structure and initial data from the `database.sql` file.
4. Configure the connection:
   - Update the `.env` file with the following details:
     ```env
     DB_HOST=127.0.0.1
     DB_PORT=3306
     DB_USER=root
     DB_PASSWORD=password
     DB_NAME=Anunturi_imobiliare
     ```

### 3. Run the Project
1. Start the backend:
   ```bash
   node server.cjs
   ```
2. Start the frontend:
   ```bash
   npm run dev
   ```
3. Access the application at:
   ```
   http://localhost:5173
   ```

## Project Structure
- **index.html**: The main page of the application.
- **vite.config.js**: Configuration for running the frontend.
- **server.cjs**: Backend code, including API routes and database connection.
- **package.json**: Lists all dependencies and useful scripts.

## Technologies Used
- **Frontend**: HTML, CSS, JavaScript, Vite.js
- **Backend**: Node.js, Express
- **Database**: MySQL

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

