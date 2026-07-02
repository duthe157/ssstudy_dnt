module.exports = {
  apps: [{
    name: 'api-luyenthitiendat',
    script: 'app.js',
    instances: 'max',
    autorestart: true,
    env: { NODE_ENV: 'develop' },
    env_uat: { NODE_ENV: 'uat' },
    env_production: { NODE_ENV: 'production' }
  }]
};
