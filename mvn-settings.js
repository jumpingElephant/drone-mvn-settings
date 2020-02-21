'use strict';
const Sqrl = require( 'squirrelly' );
const path = require( 'path' );
const fs = require( 'fs' );

Sqrl.autoEscaping( false );

const minify1 = /\s{2,}|($(\r|\n))/gm;
const minify2 = />\s</gm;

function generateSettings() {
    let settings = require( 'drone-env-parser' ).parseEnvs();

    let settingsTemplate = fs.readFileSync( path.join( __dirname, 'template', 'settings.xml' ), 'utf8' );
    let settingsFile = Sqrl.Render( settingsTemplate, settings );
    settingsFile = minify( settingsFile );

    let outputPath = 'settings.xml';
    if ( settings.custompath ) {
        outputPath = settings.custompath;
    }

    fs.writeFileSync( outputPath, settingsFile );
}

function minify( str ) {
    return str.replace( minify1, ' ' ).replace( minify2, '><' );
}

module.exports.generateSettings = generateSettings;