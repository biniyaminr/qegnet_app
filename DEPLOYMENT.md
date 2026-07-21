# Launch guide

## Vercel web launch

1. Run `npm install` and `npm run build` locally.
2. Install/login once: `npm install -g vercel` then `vercel login`.
3. From this folder run `vercel` for a preview, test it, then `vercel --prod`.
4. In Vercel: Project → Settings → Domains → Add, enter the domain.
5. At the domain registrar, add the exact DNS record Vercel displays. Keep any existing mail records.
6. When Vercel shows “Valid Configuration”, open the production URL once online, then test airplane mode.

Vercel detects Vite automatically: build command `npm run build`, output directory `dist`.

## Android closed testing

1. Install Android Studio (including current Android SDK/JDK), then run `npm run android:sync`.
2. Run `npx cap add android` once if the `android/` folder is absent; afterwards use `npm run android:sync` for every web update.
3. Run `npm run android:open`. In Android Studio, confirm the package ID is `site.axiomdigital.kinit`.
4. Replace launcher icons/splash through Android Studio’s Image Asset tool using `public/icons/icon-512.png`.
5. Choose Build → Generate Signed Bundle / APK → Android App Bundle. Create a new `.jks` upload key, store it securely outside the repository, and back it up. Select the release variant and build the `.aab`.
6. In Play Console create the app, complete App access, Ads, Content rating, Target audience, Data safety, Privacy policy, Store listing, and the required contact details. The app stores progress only on-device and does not require an account.
7. Go to Testing → Closed testing → Create track. Add an email list or Google Group with at least 12 opted-in testers, create a release, upload the signed `.aab`, add release notes, review, and roll out to the closed track.
8. Share the opt-in link. Keep at least 12 testers opted in continuously for 14 days and gather feedback before applying for production access. Follow the exact eligibility status shown by Play Console; Google can change these requirements.

Never commit the keystore, passwords, `key.properties`, or Play service-account credentials.
