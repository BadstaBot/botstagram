export const config = {
    'secrets': {
        'discord': 'discord token',
        'ksoft': 'ksoft token',
        'ocrSpace': 'ocrSpace token',
        'sentry': 'sentry DSN',
        'rollbar': 'rollbar api key'
    },

    'database': {
        'host': 'database url',
        'port': 5432, // database port
        'login': {
            'username': 'database username',
            'password': 'database password',
        },
        'database': 'database name',
    },
    'colors': {
        'success': 7506394, // success color
        'warning': 16776960, // warning color
        'error': 16728128, // error color
    },

    'owners': ['owner ID 1', 'owner ID 2', '...'],
    'development': false,
    'env': process.env.NODE_ENV as EnvironmentType,
    'appId': 'application ID',

    'logging': {
        'discordJsDebug': false, // log Discord.js debug messages
        'debug': true, // log bot debug messages
        'info': true,  // log info messages
        'warn': true,  // log warning messages
        'error': true  // log error messages
    },
    'supportServer': {
        'invite': 'aa', // server invite
        'guildId': '801506360872140841' // server ID
    }
};

type EnvironmentType = 'production' | 'canary' | 'development'
