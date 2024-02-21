
## Setup and Run Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/basic-signin-signup.git
cd basic-signin-signup
```

### 2. Install Dependencies

Make sure you have Node.js and npm installed.

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the project root and add the following content:

```env
MONGO_URI=your_atlas_url
SESSION_SECRET=This_is_top_secret
PORT=3000
```

Replace the `MONGO_URI` with your MongoDB connection string.

### 4. Run the Application

```bash
node app.js
```

The server will start, and you should see a message indicating that it's running on port 3000.

### 5. Open in Browser

Visit [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Test the Application

- Use the provided routes (e.g., `/signup`, `/login`, `/dashboard`, `/success`, `/user-data`, `/login-data`) to interact with the application.
- Check the user and login data tables.
- Delete a user and observe the pop-up message for successful deletion.


