fx_version 'adamant'
game 'gta5'
description 'Samy_Calculator'
version '1.0.0'

lua54 'yes'

shared_scripts {
    '@ox_lib/init.lua',
    'config/*.lua'
}

files {
    'web/*.html',
    'web/*.css',
    'web/*.js',
    'locales/*.json',
}

ui_page 'web/index.html'

client_scripts {
    'client/*.lua'
}