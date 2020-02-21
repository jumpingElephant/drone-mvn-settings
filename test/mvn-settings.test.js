const path = require( 'path' );
const fs = require( 'fs' );

const assert = require( 'assert' );

const generateSettings = require( '../mvn-settings' ).generateSettings;

let settingsPath = path.join( __dirname, 'settings.xml' );

process.env[ 'PLUGIN_CUSTOMPATH' ] = settingsPath;

function getSettingsXML( content ) {
    return '<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0 https://maven.apache.org/xsd/settings-1.0.0.xsd">' + content + '</settings>';
}

function readSettingsFile( custompath ) {
    if ( custompath === undefined ) {
        return fs.readFileSync( settingsPath, 'utf8' );
    } else {
        return fs.readFileSync( custompath, 'utf8' );
    }
}

function deleteSettingsFile( custompath ) {
    if ( custompath === undefined ) {
        try {
            fs.unlinkSync( settingsPath );
        } catch ( e ) { }
    } else {
        try {
            fs.unlinkSync( custompath );
        } catch ( e ) { }
    }
}

describe( 'mvn-settings', function () {
    describe( '#generateSettings()', function () {
        it( 'should create an empty settings file', function () {
            try {
                generateSettings();
                assert.strictEqual( readSettingsFile(), getSettingsXML( '' ) )
            } finally {
                deleteSettingsFile();
            }
        } );
        it( 'should add the local repository declaration', function () {
            try {
                process.env[ 'PLUGIN_LOCALREPOSITORY' ] = 'https://example.org/';
                generateSettings();
                assert.strictEqual( readSettingsFile(), getSettingsXML( '<localRepository>https://example.org/</localRepository>' ) )
            } finally {
                delete process.env[ 'PLUGIN_LOCALREPOSITORY' ];
                deleteSettingsFile();
            }
        } );
        it( 'should add the server declarations', function () {
            try {
                process.env[ 'PLUGIN_SERVERS' ] = JSON.stringify( [
                    {
                        id: 'sytm-nexus',
                        username: 'md5lukas',
                        password: 'password'
                    },
                    {
                        id: 'sonatype',
                        username: 'sona',
                        password: 'type'
                    }
                ] );
                generateSettings();
                assert.strictEqual( readSettingsFile(), getSettingsXML( '<servers><server><id>sytm-nexus</id><username>md5lukas</username><password>password</password></server>'
                    + '<server><id>sonatype</id><username>sona</username><password>type</password></server></servers>' ) );
            } finally {
                delete process.env[ 'PLUGIN_SERVERS' ];
                deleteSettingsFile();
            }
        } );
        it( 'should add the mirror declarations', function () {
            try {
                process.env[ 'PLUGIN_MIRRORS' ] = JSON.stringify( [
                    {
                        id: 'central-proxy',
                        name: 'Central Proxy',
                        url: 'https://repo.sytm.de/repository/maven-central/',
                        mirrorOf: 'central'
                    }
                ] );
                generateSettings();
                assert.strictEqual( readSettingsFile(),
                    getSettingsXML( '<mirrors><mirror><id>central-proxy</id><name>Central Proxy</name><url>https://repo.sytm.de/repository/maven-central/</url><mirrorOf>central</mirrorOf></mirror></mirrors>' ) )
            } finally {
                delete process.env[ 'PLUGIN_MIRRORS' ];
                deleteSettingsFile();
            }
        } );
    } );
} );