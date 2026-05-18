/**
 * Patch android/app/build.gradle for release signing (keystore.properties)
 */
const fs = require("fs");
const path = require("path");

const mobileRoot = path.join(__dirname, "..");
const buildGradle = path.join(mobileRoot, "android", "app", "build.gradle");

if (!fs.existsSync(buildGradle)) {
  console.error("android/app/build.gradle not found. Run: npx expo prebuild --platform android");
  process.exit(1);
}

let contents = fs.readFileSync(buildGradle, "utf8");

if (contents.includes("STOS_RELEASE_SIGNING")) {
  console.log("Signing already patched.");
  process.exit(0);
}

const signingSnippet = `
// STOS_RELEASE_SIGNING
def stosKeystorePropertiesFile = rootProject.file("../keystore.properties")
def stosKeystoreStoreFile = rootProject.file("../keystores/stos-release.keystore")
def stosKeystoreProperties = new Properties()
if (stosKeystorePropertiesFile.exists()) {
    stosKeystorePropertiesFile.withInputStream { stosKeystoreProperties.load(it) }
}
`;

const signingConfigsPatch = `
        stosRelease {
            if (stosKeystoreStoreFile.exists()) {
                storeFile stosKeystoreStoreFile
                storePassword stosKeystoreProperties.getProperty("storePassword", "stos123456")
                keyAlias stosKeystoreProperties.getProperty("keyAlias", "stos")
                keyPassword stosKeystoreProperties.getProperty("keyPassword", "stos123456")
            }
        }
`;

// Insert properties after first line or after apply plugins
if (!contents.includes("stosKeystorePropertiesFile")) {
  const applyIdx = contents.indexOf("android {");
  if (applyIdx === -1) {
    console.error("Could not find android { block");
    process.exit(1);
  }
  contents = contents.slice(0, applyIdx) + signingSnippet + "\n" + contents.slice(applyIdx);
}

if (contents.includes("signingConfigs {") && !contents.includes("stosRelease {")) {
  contents = contents.replace(/signingConfigs\s*\{/, `signingConfigs {${signingConfigsPatch}`);
}

if (contents.includes("release {") && !contents.includes("signingConfig signingConfigs.stosRelease")) {
  contents = contents.replace(
    /release\s*\{[\s\S]*?signingConfig signingConfigs\.debug/,
    `release {
            if (stosKeystoreStoreFile.exists()) {
                signingConfig signingConfigs.stosRelease
            } else {
                signingConfig signingConfigs.debug
            }`
  );
}

fs.writeFileSync(buildGradle, contents);
console.log("Patched:", buildGradle);
