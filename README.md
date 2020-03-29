# drone-mvn-settings [![Build Status](https://drone.sytm.de/api/badges/Sytm/drone-mvn-settings/status.svg)](https://drone.sytm.de/Sytm/drone-mvn-settings)

This plugin provides a simple way to create a settings.xml file for your maven pipelines

## Basic usage:

Here is an example on how to configure this plugin to create a settings.xml file defineing a mirror for maven central and providing credentials for maven repos with the id `sonatype` and setting a custom local maven repository location.
```yaml
kind: pipeline
name: maven

steps:
  - name: settings
    image: md5lukas/drone-mvn-settings
    settings:
      localRepository: /data/.m2/
      servers:
        - name: Sonatype
          id: sonatype
          username: username
          password: password
      mirrors:
        - name: Central Mirror
          id: central-mirror
          mirrorOf: central
          url: https://your.central/proxy/here
  - name: test
    image: maven:latest
    commands:
      - mvn compile -B -s settings.xml
  - name: deploy
    image: maven:latest
    commands:
      - mvn deploy -B -s settings.xml
    when:
      event:
        - tag
```
**Note**: Using the style shown above of providing servers doesn't work with secrets. To use secrets take a look at the following

## Secrets:

```yaml
kind: pipeline
name: maven

steps:
  - name: settings
    image: md5lukas/drone-mvn-settings
    settings:
      servers:
        - name: Sonatype
          id: sonatype
          username: username
      mirrors:
        - name: Central Mirror
          id: central-mirror
          mirrorOf: central
      serverSecrets:
        from_secret: maven_server_secrets
      mirrorSecrets:
        from_secret: maven_mirror_secrets
  - name: test
    image: maven:latest
    commands:
      - mvn compile -B -s settings.xml
  - name: deploy
    image: maven:latest
    commands:
      - mvn deploy -B -s settings.xml
    when:
      event:
        - tag
```
And put the following JSON values into your secrets:
```
maven_server_secrets: [{"id":"sonatype","password":"very secret password"}]
maven_mirror_secrets: [{"id":"central-mirror","url":"https://very.secret/repo/url/"}]
```
To add another server/mirror just append an additional value to the JSON array and **make sure the id in the JSON and in the .drone.yml match up**, so it can be merged into it properly.

Since the secret method merges the values that should be kept secret into the yaml file data, you still have the bonus of configuring most of the stuff in the easy to use yml format and only have to mess with JSON values for the secrets.

## Values that can be specified:

Every value in a server or mirror block in the settings.xml can be specified, if it is top level. For example:
```yaml
steps:
  - name: settings
    image: md5lukas/drone-mvn-settings
    settings:
      servers:
        - name: Sonatype
          id: sonatype
          username: username
          password: password
          a-key: a value
          also-a-key: can also be specified
          but:
            this: cannot be done
          or:
           - this
           - is
           - invalid
```
turns into this:
```xml
...
<servers>
    <server>
        <name>Sonatype</name>
        <id>sonatype</id>
        <username>username</username>
        <password>password</password>
        <a-key>a value</a-key>
        <also-a-key>can also be specified</also-a-key>
        <but>[object Object]</but>
        <or>this,is,invalid</or>
    </server>
</servers>
...
```

## Additional configuration

Additional to servers and mirrors the following values can be set for the settings.xml:
 - `localRepository`

Settings that are not directly connected to the content of the settings.xml:
 - `customPath` (default: not set, will store in current working directory) Sets the directory and filename of the settings.xml file that will be generated

## TODO:

 - [ ] Profiles
 - [ ] Proxies
 - [ ] Custom template path

[My reference for the content of the settings.xml](https://maven.apache.org/settings.html)