# Store listing assets

Template frames for App Store / Play Store screenshots:

- Use `logo-system-1-compact.png` + Life home mock (hero + shortcuts).
- Background: `#1E3066` gradient matching splash.
- Device frames: 6.7" (1290×2796) and 5.5" (1242×2208) optional.

After UI changes, capture simulator screenshots and place here before EAS submit.

Build commands:

```bash
cd apps/stos-life && npm run build:cloud:android
cd apps/stos-guard && npm run build:cloud:android
```
