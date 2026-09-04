# GitHub Repository Secrets Guide

To enable automated workflows (such as the daily campus scraper cron job in `.github/workflows/scraper.yml` and CI checks in `ci.yml`), configure the following secrets in your GitHub repository:

**Navigation:** GitHub Repository &rarr; **Settings** &rarr; **Secrets and variables** &rarr; **Actions** &rarr; **New repository secret**

---

### Required Secrets

| Secret Name | Description | Example / Location |
|---|---|---|
| `GEMINI_API_KEY` | Google Gemini Vision & LLM API key | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud identifier | Cloudinary Dashboard (e.g. `dnse1yvqq`) |
| `CLOUDINARY_API_KEY` | Master API Key with full upload permissions | Cloudinary Console &rarr; Settings &rarr; Access Keys |
| `CLOUDINARY_API_SECRET` | Master API Secret | Cloudinary Console &rarr; Settings &rarr; Access Keys |
| `CLOUDINARY_UPLOAD_PRESET`| Unsigned preset fallback | Cloudinary Console &rarr; Upload &rarr; `loop_uploads` |
| `FIREBASE_SERVICE_ACCOUNT`| Full JSON contents of `serviceAccountKey.json` | Firebase Console &rarr; Project Settings &rarr; Service Accounts |
| `APIFY_TOKEN` *(Optional)* | Apify API token for Instagram actor runs | [Apify Console](https://console.apify.com) &rarr; Settings &rarr; Integrations |

---

### Verifying Automated Scraper Cron

Once these secrets are configured:
1. Go to your repository's **Actions** tab.
2. Select **Instagram Campus Event Scraper**.
3. Click **Run workflow** &rarr; select `main` branch.
4. The workflow will download latest posters, parse metadata with Gemini Vision, upload media to Cloudinary, and queue pending cards into Firestore for admin review.
