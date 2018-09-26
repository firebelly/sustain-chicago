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
        'allowedFileExtensions' => ['ai'],
    ],

    // Dev environment settings
    'dev' => [
        // Base site URL
        'siteUrl' => 'http://sustain-chicago.localhost',

        // Dev Mode (see https://craftcms.com/support/dev-mode)
        'devMode' => true,
    ],

    // Staging environment settings
    'staging' => [
        // Base site URL
        'siteUrl' => 'http://chicagocity.webfactional.com',
    ],

    // Production environment settings
    'production' => [
        // Base site URL
        'siteUrl' => 'https://sustainchicago.cityofchicago.org',
    ],
];
