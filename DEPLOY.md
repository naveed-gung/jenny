# Deploying Jenny on Render

This guide will walk you through deploying your Jenny 3D Avatar Chat application on Render.com.

## Prerequisites

1. A GitHub account with your Jenny project pushed to a repository
2. A Render.com account
3. Your API keys:
   - ElevenLabs API key
   - Google Gemini API key
   - SpeechGen API key and email (if you're using child voice)

## Deployment Steps

### 1. Push Your Code to GitHub

Make sure your most recent code is pushed to GitHub:

```bash
git add .
git commit -m "Prepare for Render deployment"
git push
```

### 2. Deploy Using Render Blueprint

The easiest way to deploy is using the render.yaml file included in the repository:

1. Log in to [Render.com](https://render.com/)
2. Click on the "New" button in the dashboard
3. Select "Blueprint" from the dropdown menu
4. Connect your GitHub account if you haven't already
5. Select the repository containing your Jenny application
6. Render will automatically detect the render.yaml file and propose creating the defined services
7. Click "Apply" to start the deployment process

### 3. Set Environment Variables

After the services are created, you'll need to set up environment variables:

1. Go to the dashboard and select your backend service (jenny-backend)
2. Navigate to the "Environment" tab
3. Add the following environment variables:
   - `ELEVEN_LABS_API_KEY`: Your ElevenLabs API key
   - `GEMINI_API_KEY`: Your Google Gemini API key
   - `SPEECHGEN_API_KEY`: Your SpeechGen API key (if using child voice)
   - `SPEECHGEN_EMAIL`: Your SpeechGen email (if using child voice)
   - `NODE_ENV`: Set to `production`

4. Save the changes

### 4. Deploy Individual Services (Alternative Method)

If the Blueprint deployment doesn't work, you can deploy the services individually:

#### Backend Service

1. In your Render dashboard, click "New" and select "Web Service"
2. Connect to your GitHub repository
3. Configure the service:
   - Name: `jenny-backend`
   - Environment: `Node`
   - Region: Choose the region closest to your users
   - Branch: `main` (or your deployment branch)
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && node index.js`
   - Set the environment variables mentioned above
4. Click "Create Web Service"

#### Frontend Service

1. In your Render dashboard, click "New" and select "Static Site"
2. Connect to your GitHub repository
3. Configure the service:
   - Name: `jenny-frontend`
   - Environment: `Static Site`
   - Branch: `main` (or your deployment branch)
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/dist`
   - Set environment variable:
     - `VITE_API_URL`: URL of your backend service (e.g., https://jenny-backend.onrender.com)
4. Click "Create Static Site"

### 5. Verify Deployment

1. Once both services are deployed, open your frontend URL (e.g., https://jenny-frontend.onrender.com)
2. Test the application by sending a message
3. Check the logs of both services for any errors

### Troubleshooting

- **CORS Issues**: If you get CORS errors, make sure your backend CORS configuration includes your frontend URL
- **API Key Errors**: Verify all API keys are correctly set in the environment variables
- **Build Failures**: Check the build logs for any errors and address them accordingly

### Important Notes

- The free tier of Render has some limitations:
  - Services spin down after inactivity
  - Limited compute resources
  - Limited bandwidth
- For production use, consider upgrading to a paid plan

### Maintenance

To update your deployed application:

1. Push changes to your GitHub repository
2. Render will automatically rebuild and deploy your changes

For manual deployments:

1. Go to your service in the Render dashboard
2. Click on "Manual Deploy" > "Deploy latest commit" 