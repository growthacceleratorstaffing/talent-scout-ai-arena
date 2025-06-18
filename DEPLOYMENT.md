
# Deployment Guide

## Azure Static Web Apps (Primary - main branch)

The main branch automatically deploys to Azure Static Web Apps when changes are pushed.

### Required Secrets:
- `AZURE_STATIC_WEB_APPS_API_TOKEN` - From Azure portal
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key

### Workflow: `.github/workflows/azure-deploy.yml`

## Azure App Service (azure-app-service branch)

For dynamic deployment scenarios, use the `azure-app-service` branch.

### Required Secrets:
- `AZUREAPPSERVICE_PUBLISHPROFILE_*` - Download from Azure portal
- `VITE_SUPABASE_URL` - Your Supabase project URL  
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key

### Workflow: `.github/workflows/azure-app-service.yml`

## Workflow Overview

1. **Code Quality** - Runs on all PRs and pushes
2. **Security Checks** - Runs weekly and on main branch changes
3. **Azure Static Web Apps** - Deploys main branch automatically
4. **Azure App Service** - Deploys azure-app-service branch on demand

## Branch Strategy

- `main` → Azure Static Web Apps (automatic)
- `azure-app-service` → Azure App Service (manual trigger available)
- Feature branches → PR checks only

## Manual Deployment

You can manually trigger the Azure App Service deployment using GitHub's "Run workflow" button.
