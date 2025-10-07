# Netlify Deployment Guide

## 🚀 Deploying Your AI Food Logger to Netlify

### Prerequisites
- Netlify account (free at netlify.com)
- GitHub repository with your code
- Backend API deployed (see Backend Deployment section)

### Frontend Deployment (Netlify)

#### Option 1: Deploy from GitHub (Recommended)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for Netlify deployment"
   git push origin main
   ```

2. **Connect to Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Choose "GitHub" and select your repository
   - Configure build settings:
     - **Build command**: `cd frontend && npm run build`
     - **Publish directory**: `frontend/build`
     - **Node version**: 18

3. **Environment Variables**:
   - Go to Site settings → Environment variables
   - Add: `REACT_APP_API_URL` = `https://your-backend-api.herokuapp.com`

#### Option 2: Deploy from Local Build

1. **Build the frontend**:
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop the `frontend/build` folder
   - Or use Netlify CLI: `netlify deploy --prod --dir=frontend/build`

### Backend Deployment (Heroku)

#### 1. Prepare for Heroku

Create `Procfile` in the root directory:
```
web: npm start
```

Update `package.json` scripts:
```json
{
  "scripts": {
    "start": "node dist/server.js",
    "build": "npm run build:backend",
    "build:backend": "tsc",
    "build:frontend": "cd frontend && npm run build"
  }
}
```

#### 2. Deploy to Heroku

```bash
# Install Heroku CLI
# Create Heroku app
heroku create your-food-logger-api

# Set environment variables
heroku config:set OPENAI_API_KEY=your_openai_key
heroku config:set NODE_ENV=production
heroku config:set PORT=3000

# Deploy
git subtree push --prefix=. heroku main
```

### Environment Variables

#### Frontend (Netlify)
- `REACT_APP_API_URL`: Your backend API URL

#### Backend (Heroku)
- `OPENAI_API_KEY`: Your OpenAI API key
- `NODE_ENV`: production
- `PORT`: 3000

### Custom Domain (Optional)

1. Go to Site settings → Domain management
2. Add your custom domain
3. Configure DNS records as instructed by Netlify

### Monitoring

- **Frontend**: Netlify provides built-in analytics
- **Backend**: Use Heroku logs: `heroku logs --tail`
- **Errors**: Check the error monitor in your app

### Troubleshooting

#### Common Issues:

1. **Build fails**: Check Node version (should be 18)
2. **API calls fail**: Verify `REACT_APP_API_URL` is set correctly
3. **CORS errors**: Ensure backend allows your Netlify domain

#### Debug Commands:

```bash
# Check Netlify build logs
netlify logs

# Check Heroku logs
heroku logs --tail

# Test API locally
curl https://your-api.herokuapp.com/health
```

### Performance Optimization

1. **Enable Netlify's CDN**: Automatic with Netlify
2. **Compress images**: Use WebP format
3. **Minify code**: Automatic with React build
4. **Cache headers**: Configured in `netlify.toml`

### Security

- Environment variables are secure in Netlify/Heroku
- HTTPS is automatic
- CORS is configured for your domain only

### Cost

- **Netlify**: Free tier includes 100GB bandwidth
- **Heroku**: Free tier available (with limitations)
- **OpenAI API**: Pay per use

### Next Steps

1. Set up monitoring with Sentry (optional)
2. Configure custom domain
3. Set up CI/CD for automatic deployments
4. Add performance monitoring

## 🎉 Your AI Food Logger is now live on the web!
