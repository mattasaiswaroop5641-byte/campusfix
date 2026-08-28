# CampusFix MongoDB Backend

This is the Node.js + Express + MongoDB backend prepared for CampusFix.

## Quick Setup for Team / Backend Developer

1. Navigate to the server folder:
   ```bash
   cd server
   npm install
   ```

2. Create a `.env` file:
   ```bash
   copy .env.example .env
   ```
   Add your MongoDB Atlas URI in `.env`.

3. Start the API Server:
   ```bash
   npm start
   ```
   Server runs on `http://localhost:5000/api`

4. API Endpoints Available:
   - `GET /api/health` - Checks MongoDB connection status
   - `GET /api/issues` - Lists all campus issues
   - `POST /api/issues` - Creates a new issue with AI analysis
   - `PATCH /api/issues/:id` - Updates status or assigns maintenance staff
   - `DELETE /api/issues/:id` - Deletes a ticket
