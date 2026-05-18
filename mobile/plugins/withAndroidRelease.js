const { withAppBuildGradle } = require("expo/config-plugins");

/** Copy APK release vào mobile/release/ sau assembleRelease */
function withAndroidRelease(config) {
  return withAppBuildGradle(config, (mod) => {
    let contents = mod.modResults.contents;

    if (!contents.includes("STOS_COPY_RELEASE_APK")) {
      contents += `

// STOS_COPY_RELEASE_APK
afterEvaluate {
    tasks.register("copyReleaseApkToReleaseFolder", Copy) {
        dependsOn("assembleRelease")
        from("\${layout.buildDirectory.get()}/outputs/apk/release")
        into("\${rootProject.projectDir}/../release")
        include("*.apk")
        doLast {
            println("STOS: APK -> " + new File("\${rootProject.projectDir}/../release").absolutePath)
        }
    }
    tasks.named("assembleRelease").configure { finalizedBy("copyReleaseApkToReleaseFolder") }
}
`;
    }

    mod.modResults.contents = contents;
    return mod;
  });
}

module.exports = withAndroidRelease;
