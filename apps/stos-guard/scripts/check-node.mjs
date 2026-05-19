const major = Number(process.versions.node.split(".")[0]);
if (major < 20) {
  console.error("\n❌ Cần Node.js 20 trở lên (Expo SDK 54 / Metro).");
  console.error(`   Hiện tại: v${process.versions.node}`);
  console.error("   Chạy: nvm use 20   (hoặc nvm install 20)\n");
  process.exit(1);
}
