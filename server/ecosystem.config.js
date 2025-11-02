module.exports = {
  apps: [
    {
      name: 'vybe-backend',
      script: './server.js',
      instances: 'max', // Use all CPU cores
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 5001
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5001
      },
      // Performance monitoring
      max_memory_restart: '500M',
      
      // Error handling
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Auto restart on file changes (development only)
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'uploads'],
      
      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      
      // Advanced features
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      
      // Environment-specific settings
      instance_var: 'INSTANCE_ID'
    }
  ]
};
