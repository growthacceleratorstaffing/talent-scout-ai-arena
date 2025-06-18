
# Deployment Guide

## Azure App Service (Primary - main branch)

The main branch automatically deploys to Azure App Service when changes are pushed.

### Required Secrets:
- `AZUREAPPSERVICE_PUBLISHPROFILE_0BF8A2FE838248BC9D4FD17494AE3A97` - Download from Azure portal
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key

### Workflow: `.github/workflows/azure-app-service.yml`

## Workflow Overview

1. **Code Quality** - Runs on all PRs and pushes to main
2. **Security Checks** - Runs weekly and on main branch changes
3. **Azure App Service** - Deploys main branch automatically (manual trigger available)

## Manual Deployment

You can manually trigger the Azure App Service deployment using GitHub's "Run workflow" button in the Actions tab.

## Azure App Service Configuration

Make sure your Azure App Service is configured to:
- Use Node.js 20.x runtime
- Deploy from the `main` branch
- Use the correct publish profile in GitHub secrets
