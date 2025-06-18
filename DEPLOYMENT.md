
# Deployment Guide

## Azure App Service (Primary - main branch)

The main branch automatically deploys to Azure App Service when changes are pushed.

### Required Secrets:
- `AZUREAPPSERVICE_PUBLISHPROFILE_0BF8A2FE838248BC9D4FD17494AE3A97` - Download from Azure portal
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key

### Workflow: `.github/workflows/azure-app-service.yml`

## 24/7 Uptime Features

The application includes built-in features to ensure 24/7 availability:

### Server-Side Keep-Alive
- **Internal ping system**: Server pings itself every 4 minutes to prevent Azure from putting the app to sleep
- **Health endpoints**: Multiple endpoints (`/health`, `/api/health`, `/api/keep-alive`) for monitoring
- **Ping counter**: Tracks activity and last ping times

### Client-Side Keep-Alive
- **Browser wake lock**: Prevents browser tabs from sleeping when possible
- **Regular health checks**: Client pings server every 5 minutes
- **Visual indicators**: Shows keep-alive status in monitoring dashboard

### Monitoring Dashboard
- Real-time service health status
- Auto-correction capabilities
- Keep-alive service control
- 24/7 monitoring toggle

## Azure App Service Configuration

Make sure your Azure App Service is configured to:
- **Use Node.js 20.x runtime**
- **Deploy from the `main` branch**
- **Use the correct publish profile in GitHub secrets**
- **Set to "Always On"** in Azure portal (Configuration > General Settings)
- **Configure proper scaling** (Scale up/Scale out as needed)

### Important Azure Settings for 24/7 Uptime:
1. **Always On**: Must be enabled to prevent cold starts
2. **Application Insights**: Enable for monitoring and alerting
3. **Health Check**: Configure health check path to `/health`
4. **Auto-scaling**: Consider enabling if traffic varies

## Workflow Overview

1. **Code Quality** - Runs on all PRs and pushes to main
2. **Security Checks** - Runs weekly and on main branch changes  
3. **Azure App Service** - Deploys main branch automatically (manual trigger available)
4. **Keep-Alive Monitoring** - Automatic 24/7 uptime maintenance

## Manual Deployment

You can manually trigger the Azure App Service deployment using GitHub's "Run workflow" button in the Actions tab.

## Troubleshooting 24/7 Uptime

If the app goes to sleep despite keep-alive mechanisms:

1. **Check Azure "Always On" setting** - This is the most common issue
2. **Verify health endpoints** are responding (visit `/health` directly)
3. **Check Application Insights** for any errors or cold starts
4. **Review server logs** for keep-alive ping confirmations
5. **Ensure proper Azure App Service plan** (Basic or higher for Always On)

```

