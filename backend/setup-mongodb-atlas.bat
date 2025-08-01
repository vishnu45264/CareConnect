@echo off
echo ========================================
echo MongoDB Atlas Setup for Care Connect
echo ========================================
echo.

echo Step 1: Create MongoDB Atlas Account
echo 1. Go to https://www.mongodb.com/atlas
echo 2. Click "Try Free" or "Sign Up"
echo 3. Create your account
echo.
pause

echo Step 2: Create a Cluster
echo 1. Click "Build a Database"
echo 2. Choose "FREE" tier (M0)
echo 3. Select your preferred cloud provider
echo 4. Choose a region close to you
echo 5. Click "Create"
echo.
pause

echo Step 3: Set Up Database Access
echo 1. In the left sidebar, click "Database Access"
echo 2. Click "Add New Database User"
echo 3. Username: careconnect
echo 4. Password: Create a strong password (save it!)
echo 5. Role: "Read and write to any database"
echo 6. Click "Add User"
echo.
pause

echo Step 4: Set Up Network Access
echo 1. In the left sidebar, click "Network Access"
echo 2. Click "Add IP Address"
echo 3. Click "Allow Access from Anywhere" (for development)
echo 4. Click "Confirm"
echo.
pause

echo Step 5: Get Connection String
echo 1. Click "Database" in the left sidebar
echo 2. Click "Connect"
echo 3. Choose "Connect your application"
echo 4. Copy the connection string
echo.
pause

echo Step 6: Create .env file
echo Creating .env file...
copy env.example .env
echo.
echo IMPORTANT: Edit the .env file and replace the MONGODB_URI with your Atlas connection string
echo.
echo Example:
echo MONGODB_URI=mongodb+srv://careconnect:your-password@cluster0.mongodb.net/care_connect?retryWrites=true^&w=majority
echo.
pause

echo Step 7: Install Dependencies
echo Installing backend dependencies...
npm install
echo.

echo Step 8: Start the Server
echo Starting the server...
npm run dev
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Your backend should now be running at http://localhost:5000
echo MongoDB Atlas connection should be working!
echo.
pause 