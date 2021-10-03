module.exports = {
    apps: [
        {
            name: 'botstagram',
            script: './build/src/index.js',
            env_production: {
                NODE_ENV: 'production'
            },
            env_canary: {
                NODE_ENV: 'canary'
            },
            env_development: {
                NODE_ENV: 'development'
            }
        }
    ]
};
