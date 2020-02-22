'use strict';
const Sqrl = require( 'squirrelly' );
const path = require( 'path' );
const fs = require( 'fs' );
const extend = require( 'extend' );

Sqrl.autoEscaping( false );

const minify1 = /\s{2,}|($(\r|\n))/gm;
const minify2 = />\s</gm;

function generateSettings() {
    let settings = require( 'drone-env-parser' ).parseEnvs();

    if ( settings.serversecrets ) {
        settings.servers = extendArray( 'id', settings.servers, settings.serversecrets );
    }
    if ( settings.mirrorsecrets ) {
        settings.mirrors = extendArray( 'id', settings.mirrors, settings.mirrorsecrets );
    }

    let settingsTemplate = fs.readFileSync( path.join( __dirname, 'template', 'settings.xml' ), 'utf8' );
    let settingsFile = Sqrl.Render( settingsTemplate, settings );
    if ( settings.minify !== false )
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

function extendArray( uniqueKey, targetArray, sourceArray ) {
    if ( targetArray === undefined ) {
        return sourceArray;
    }
    sourceArray.forEach( sourceElement => {
        let targetElementIndex = targetArray.findIndex( targetElement => targetElement[ uniqueKey ] === sourceElement[ uniqueKey ] );
        if ( targetElementIndex === -1 ) {
            targetArray.push( sourceElement );
        } else {
            extend( true, targetArray[ targetElementIndex ], sourceElement );
        }
    } );
    return targetArray;
}

module.exports = {
    generateSettings,
    minify,
    extendArray
}