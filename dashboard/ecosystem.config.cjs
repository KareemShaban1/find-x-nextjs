/**
 * PM2 ecosystem file for Find X Dashboard.
 * Run from dashboard folder: pm2 start ecosystem.config.cjs
 * Or from project root: pm2 start dashboard/ecosystem.config.cjs
 */
module.exports = {
  apps: [
    {
      name: 'findx-dashboard',
      cwd: __dirname,
      script: 'node_modules/.bin/next',
      args: 'start -p 3008',
      interpreter: 'none',
      env: { NODE_ENV: 'production' },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
    },
  ],
};
