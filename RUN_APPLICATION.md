# Running the Application

This guide explains how to properly run both the frontend and backend applications.

## Backend Setup

1. Navigate to the backend directory:
```
cd backend
```

2. Install dependencies (if not already done):
```
npm install
```

3. Start the backend server:
```
npm run dev
```

The backend server should start on port 5000 (http://localhost:5000).

## Frontend Setup

1. Open a new terminal window/tab

2. Navigate to the frontend directory:
```
cd frontend
```

3. Install dependencies (if not already done):
```
npm install
```

4. Start the frontend application:
```
npm start
```

The frontend application should start on port 3000 (http://localhost:3000).

## Troubleshooting Image Loading Issues

If you're experiencing issues with image loading:

1. Ensure the backend server is running
2. Check that Supabase storage is properly configured (see SUPABASE_STORAGE_SETUP.md)
3. Verify that images have been uploaded to the correct Supabase bucket
4. Open your browser's developer tools (F12) to check for CORS errors
5. Use the ImageDebug component to diagnose specific image loading problems

## PowerShell Command Execution

If you're using PowerShell on Windows, note that the `&&` operator is not supported for chaining commands. Instead, use separate commands or semicolons:

```
cd backend; npm run dev
```

Or run each command separately:
```
cd backend
npm run dev
```

In a new terminal:
```
cd frontend
npm start
``` 