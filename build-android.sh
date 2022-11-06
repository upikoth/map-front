#!/usr/bin/env bash
export PROJECT_PATH=$PWD/src-cordova
export BUILD_NAME=null_app.apks
export APP_NAME=null_app.apk

quasar build -m android

java -jar ~/bundletool-all-1.12.1.jar build-apks --bundle=$PROJECT_PATH/platforms/android/app/build/outputs/bundle/release/app-release.aab --output=$PROJECT_PATH/$BUILD_NAME --mode=universal

unzip -p $PROJECT_PATH/$BUILD_NAME universal.apk > $PROJECT_PATH/builds/$APP_NAME

$ANDROID_HOME/build-tools/30.0.3/apksigner sign --ks  $PROJECT_PATH/my-release-key.keystore --ks-key-alias alias_name $PROJECT_PATH/builds/$APP_NAME

cp $PROJECT_PATH/builds/$APP_NAME $PWD/public/$APP_NAME

rm $PROJECT_PATH/$BUILD_NAME
