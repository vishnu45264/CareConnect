# MongoDB Atlas Setup for Care Connect
Write-Host "========================================" -ForegroundColor Green
Write-Host "MongoDB Atlas Setup for Care Connect" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Step 1: Create MongoDB Atlas Account" -ForegroundColor Yellow
Write-Host "1. Go to https://www.mongodb.com/atlas"
Write-Host "2. Click 'Try Free' or 'Sign Up'"
Write-Host "3. Create your account"
Write-Host ""
Read-Host "Press Enter to continue"

Write-Host "Step 2: Create a Cluster" -ForegroundColor Yellow
Write-Host "1. Click 'Build a Database'"
Write-Host "2. Choose 'FREE' tier (M0)"
Write-Host "3. Select your preferred cloud provider"
Write-Host "4. Choose a region close to you"
Write-Host "5. Click 'Create'"
Write-Host ""
Read-Host "Press Enter to continue"

Write-Host "Step 3: Set Up Database Access" -ForegroundColor Yellow
Write-Host "1. In the left sidebar, click 'Database Access'"
Write-Host "2. Click 'Add New Database User'"
Write-Host "3. Username: careconnect"
Write-Host "4. Password: Create a strong password (save it!)"
Write-Host "5. Role: 'Read and write to any database'"
Write-Host "6. Click 'Add User'"
Write-Host ""
Read-Host "Press Enter to continue"

Write-Host "Step 4: Set Up Network Access" -ForegroundColor Yellow
Write-Host "1. In the left sidebar, click 'Network Access'"
Write-Host "2. Click 'Add IP Address'"
Write-Host "3. Click 'Allow Access from Anywhere' (for development)"
Write-Host "4. Click 'Confirm'"
Write-Host ""
Read-Host "Press Enter to continue"

Write-Host "Step 5: Get Connection String" -ForegroundColor Yellow
Write-Host "1. Click 'Database' in the left sidebar"
Write-Host "2. Click 'Connect'"
Write-Host "3. Choose 'Connect your application'"
Write-Host "4. Copy the connection string"
Write-Host ""
Read-Host "Press Enter to continue"

Write-Host "Step 6: Create .env file" -ForegroundColor Yellow
Write-Host "Creating .env file..."
if (Test-Path "env.example") {
    Copy-Item "env.example" ".env"
    Write-Host "Created .env file from env.example"
} else {
    Write-Host "Error: env.example not found!" -ForegroundColor Red
    exit 1
}
Write-Host ""
Write-Host "IMPORTANT: Edit the .env file and replace the MONGODB_URI with your Atlas connection string" -ForegroundColor Red
Write-Host ""
Write-Host "Example:" -ForegroundColor Cyan
Write-Host "MONGODB_URI=mongodb+srv://careconnect:your-password@cluster0.mongodb.net/care_connect?retryWrites=true&w=majority" -ForegroundColor Gray
Write-Host ""
Read-Host "Press Enter to continue"

Write-Host "Step 7: Install Dependencies" -ForegroundColor Yellow
Write-Host "Installing backend dependencies..."
npm install
Write-Host ""

Write-Host "Step 8: Start the Server" -ForegroundColor Yellow
Write-Host "Starting the server..."
npm run dev
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your backend should now be running at http://localhost:5000" -ForegroundColor Cyan
Write-Host "MongoDB Atlas connection should be working!" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to exit" 