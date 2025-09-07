# Deployment Guide

This document provides instructions for deploying the AI Voice Feedback Dashboard to either Vercel or Render.

## Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- A Vercel or Render account
- Your API backend deployed and accessible

## Environment Variables

Before deployment, make sure to set up the following environment variables:

- `VITE_API_BASE_URL`: URL of your API backend (e.g., https://your-api.example.com/api)
- `VITE_APP_ENV`: Set to `production` for production deployments
- `VITE_ENABLE_ANALYTICS`: Set to `true` to enable analytics
- `VITE_ENABLE_ERROR_REPORTING`: Set to `true` to enable error reporting

## Deploying to Vercel

1. **Push your code to a Git repository** (GitHub, GitLab, or Bitbucket)

2. **Import your project to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your Git repository
   - Select the repository containing this project

3. **Configure the project**:
   - Framework Preset: Select "Vite"
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Set environment variables**:
   - Add all required environment variables in the Vercel project settings

5. **Deploy**:
   - Click "Deploy"
   - Vercel will build and deploy your application

6. **Verify deployment**:
   - Once deployed, Vercel will provide a URL to access your application
   - Test the application to ensure it's working correctly

## Deploying to Render

1. **Push your code to a Git repository** (GitHub or GitLab)

2. **Create a new Web Service on Render**:
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New" and select "Web Service"
   - Connect your Git repository

3. **Configure the service**:
   - Name: `ai-voice-feedback-dashboard` (or your preferred name)
   - Environment: Static Site
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

4. **Set environment variables**:
   - Add all required environment variables in the Render environment settings

5. **Deploy**:
   - Click "Create Web Service"
   - Render will build and deploy your application

6. **Verify deployment**:
   - Once deployed, Render will provide a URL to access your application
   - Test the application to ensure it's working correctly

## Using the Render YAML Configuration

This project includes a `render.yaml` file for easier deployment to Render:

1. **Create a Blueprint on Render**:
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New" and select "Blueprint"
   - Connect your Git repository
   - Render will automatically detect the `render.yaml` file and configure the service

2. **Set environment variables**:
   - Add any required environment variables not defined in the YAML file

3. **Deploy**:
   - Click "Apply"
   - Render will build and deploy your application according to the YAML configuration

## Continuous Deployment

Both Vercel and Render support continuous deployment. When you push changes to your Git repository, your application will be automatically rebuilt and redeployed.

## Troubleshooting

### Common Issues

1. **API Connection Issues**:
   - Ensure your `VITE_API_BASE_URL` is correctly set and accessible
   - Check for CORS issues if your API is hosted on a different domain

2. **Build Failures**:
   - Check the build logs for errors
   - Ensure all dependencies are correctly installed
   - Verify that your code passes all linting and type checks

3. **Environment Variables**:
   - Verify that all required environment variables are set
   - Check for typos in environment variable names

### Getting Help

If you encounter issues during deployment, check the deployment platform's documentation:

- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)