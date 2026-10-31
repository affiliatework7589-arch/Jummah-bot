module.exports = {
  apps: [{
    name: 'jummah-bot',
    script: './index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    },
    // Restart policy
    restart_delay: 5000,
    max_restarts: 10,
    // Logging
    out_file: './logs/jummah.log',
    error_file: './logs/error.log',
    merge_logs: true
  }]
};
