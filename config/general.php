<?php
/**
 * General Configuration
 *
 * All of your system's general configuration settings go in here. You can see a
 * list of the available settings in vendor/craftcms/cms/src/config/GeneralConfig.php.
 *
 * @see craft\config\GeneralConfig
 */

return [
    // Global settings
    '*' => [
        // Default Week Start Day (0 = Sunday, 1 = Monday...)
        'defaultWeekStartDay' => 0,

        // Enable CSRF Protection (recommended)
        'enableCsrfProtection' => true,

        // Whether generated URLs should omit "index.php"
        'omitScriptNameInUrls' => true,

        // Control Panel trigger word
        'cpTrigger' => 'admin',

        // The secure key Craft will use for hashing and encrypting data
        'securityKey' => getenv('SECURITY_KEY'),

        // Additional allowed file extensions for uploads
        'extraAllowedFileExtensions' => ['ai'],
    ],

    // Dev environment settings
    'dev' => [
        // Base site URL
        'siteUrl' => array(
            'en-US' => 'http://sustain-chicago.localhost',
            'es' => 'http://sustain-chicago.localhost/es/',
            'zh-Hans-CN' => 'http://sustain-chicago.localhost/cn/',
            'pl' => 'http://sustain-chicago.localhost/pl/',
            'ar ' => 'http://sustain-chicago.localhost/ar/',
        ),

        // Dev Mode (see https://craftcms.com/support/dev-mode)
        'devMode' => true,
    ],

    // Staging environment settings
    'staging' => [
        // Base site URL
        'siteUrl' => array(
            'en-US' => 'http://chicagocity.webfactional.com',
            'es' => 'http://chicagocity.webfactional.com/es/',
            'zh-Hans-CN' => 'http://chicagocity.webfactional.com/cn/',
            'pl' => 'http://chicagocity.webfactional.com/pl/',
            'ar ' => 'http://chicagocity.webfactional.com/ar/',
        ),
    ],

    // Production environment settings
    'production' => [
        // Base site URL
        'siteUrl' => array(
            'en-US' => 'https://sustainchicago.cityofchicago.org',
            'es' => 'https://sustainchicago.cityofchicago.org/es/',
            'zh-Hans-CN' => 'https://sustainchicago.cityofchicago.org/cn/',
            'pl' => 'https://sustainchicago.cityofchicago.org/pl/',
            'ar ' => 'https://sustainchicago.cityofchicago.org/ar/',
        ),
    ],
];
