2019-08-16| Migrating to cordova-andoid 8.0.0

error @minmap/icon error in background-geolocation plugins. Tried this,

This is from: github.com/oliviercherrier/mauron85-background-geolocation-example-ionic2

    C:\mauron85-background-geolocation-example-ionic2\platforms\android\res\xml\auth
    enticator.xml:5:19-31: AAPT: No resource found that matches the given name (at '
    icon' with value '@mipmap/icon').

    C:\mauron85-background-geolocation-example-ionic2\platforms\android\res\xml\auth
    enticator.xml:6:24-36: AAPT: No resource found that matches the given name (at '
    smallIcon' with value '@mipmap/icon').

    Add a copy of file ./platforms/android/res/mimap-whatever/ic_launcher.png to ./platforms/android/res/mipap/icon.png andd run ionic run android again

This did not work, then tried
https://github.com/mauron85/cordova-plugin-background-geolocation/issues/553
especially
https://github.com/mauron85/cordova-plugin-background-geolocation/issues/553#issuecomment-468338816
. This worked.
