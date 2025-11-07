# Analytics Automation Strategy for New Sites

**Goal:** Automatically add Google Analytics + Facebook Pixel to all new therapy landing pages

---

## Prerequisites (One-Time Setup)

### 1. Google Analytics Admin API Access

**Enable API & Get OAuth Credentials:**

```bash
# Enable the API
gcloud services enable analyticsadmin.googleapis.com

# Authenticate with correct scopes
gcloud auth application-default login \
  --scopes=https://www.googleapis.com/auth/analytics.edit,https://www.googleapis.com/auth/analytics.readonly
```

**Or use Service Account (Better for Automation):**
1. Go to https://console.cloud.google.com/
2. IAM & Admin → Service Accounts → Create
3. Grant role: "Analytics Admin"
4. Create JSON key → Save to `~/.config/gcloud/analytics-service-account.json`

### 2. Facebook Business Access Token

**Get Long-Lived Access Token:**
1. Go to https://developers.facebook.com/tools/explorer/
2. Select your app
3. Get User Access Token with `business_management` permission
4. Exchange for long-lived token (60 days)
5. Store in environment variable

---

## Automation Workflow

### Step 1: Create GA4 Property via API

**Script:** `scripts/create-ga4-property.sh`

```bash
#!/bin/bash
# Create new GA4 property for therapy landing page

SITE_NAME="$1"  # e.g., "Oakland Brainspotting Therapy"
SITE_DOMAIN="$2"  # e.g., "oaklandbrainspottingtherapy.com"
GA_ACCOUNT_ID="$3"  # Your GA4 account ID (e.g., "12345678")

TOKEN=$(gcloud auth application-default print-access-token)

# Create property
RESPONSE=$(curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "https://analyticsadmin.googleapis.com/v1beta/accounts/${GA_ACCOUNT_ID}/properties" \
  -d '{
    "displayName": "'"${SITE_NAME}"'",
    "industryCategory": "HEALTH",
    "timeZone": "America/Los_Angeles",
    "currencyCode": "USD",
    "propertyType": "PROPERTY_TYPE_ORDINARY"
  }')

# Extract property ID
PROPERTY_ID=$(echo "$RESPONSE" | jq -r '.name' | cut -d'/' -f2)

# Create data stream
STREAM_RESPONSE=$(curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "https://analyticsadmin.googleapis.com/v1beta/properties/${PROPERTY_ID}/dataStreams" \
  -d '{
    "displayName": "'"${SITE_DOMAIN}"' Web Stream",
    "type": "WEB_DATA_STREAM",
    "webStreamData": {
      "defaultUri": "https://'"${SITE_DOMAIN}"'"
    }
  }')

# Extract measurement ID
MEASUREMENT_ID=$(echo "$STREAM_RESPONSE" | jq -r '.webStreamData.measurementId')

echo "✅ GA4 Property Created:"
echo "   Property ID: ${PROPERTY_ID}"
echo "   Measurement ID: ${MEASUREMENT_ID}"
echo ""
echo "Add this to your .env file:"
echo "GA_MEASUREMENT_ID=${MEASUREMENT_ID}"
```

**Usage:**
```bash
./scripts/create-ga4-property.sh \
  "Oakland Brainspotting Therapy" \
  "oaklandbrainspottingtherapy.com" \
  "123456789"  # Your GA4 account ID
```

---

### Step 2: Create Facebook Pixel via API

**Script:** `scripts/create-fb-pixel.sh`

```bash
#!/bin/bash
# Create new Facebook Pixel for therapy landing page

SITE_NAME="$1"
FB_BUSINESS_ID="$2"
FB_ACCESS_TOKEN="${FB_ACCESS_TOKEN}"  # From environment

# Create pixel
RESPONSE=$(curl -s -X POST \
  "https://graph.facebook.com/v18.0/${FB_BUSINESS_ID}/adspixels" \
  -d "name=${SITE_NAME} - Pixel" \
  -d "access_token=${FB_ACCESS_TOKEN}")

PIXEL_ID=$(echo "$RESPONSE" | jq -r '.id')

echo "✅ Facebook Pixel Created:"
echo "   Pixel ID: ${PIXEL_ID}"
echo ""
echo "Add this to your .env file:"
echo "FB_PIXEL_ID=${PIXEL_ID}"
```

---

### Step 3: Add Tracking to Astro Site

**Script:** `scripts/add-analytics-tracking.sh`

```bash
#!/bin/bash
# Add GA4 + Facebook Pixel to Astro site

SITE_DIR="$1"
GA_MEASUREMENT_ID="$2"
FB_PIXEL_ID="$3"

# Create analytics component
cat > "${SITE_DIR}/src/components/Analytics.astro" << 'EOF'
---
const { gaId, fbPixelId } = Astro.props;
---

<!-- Google Analytics 4 -->
{gaId && (
  <>
    <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}></script>
    <script define:vars={{ gaId }}>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', gaId);
    </script>
  </>
)}

<!-- Facebook Pixel -->
{fbPixelId && (
  <script define:vars={{ fbPixelId }}>
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', fbPixelId);
    fbq('track', 'PageView');
  </script>
  <noscript>
    <img height="1" width="1" style="display:none"
      src={`https://www.facebook.com/tr?id=${fbPixelId}&ev=PageView&noscript=1`}
    />
  </noscript>
)}
EOF

# Update Layout.astro to include Analytics component
echo ""
echo "✅ Analytics component created: ${SITE_DIR}/src/components/Analytics.astro"
echo ""
echo "Add to your Layout.astro <head>:"
echo '<Analytics gaId={import.meta.env.PUBLIC_GA_MEASUREMENT_ID} fbPixelId={import.meta.env.PUBLIC_FB_PIXEL_ID} />'
```

---

### Step 4: Environment Variables

**Create `.env` file:**

```bash
# .env
PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
PUBLIC_FB_PIXEL_ID=1234567890123456
```

**Update `astro.config.mjs`:**

```javascript
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';

const { PUBLIC_GA_MEASUREMENT_ID, PUBLIC_FB_PIXEL_ID } = loadEnv(
  process.env.NODE_ENV,
  process.cwd(),
  ''
);

export default defineConfig({
  // ... other config
  vite: {
    define: {
      'import.meta.env.PUBLIC_GA_MEASUREMENT_ID': JSON.stringify(PUBLIC_GA_MEASUREMENT_ID),
      'import.meta.env.PUBLIC_FB_PIXEL_ID': JSON.stringify(PUBLIC_FB_PIXEL_ID)
    }
  }
});
```

---

## Complete Automation Script

**Script:** `scripts/setup-new-therapy-site.sh`

```bash
#!/bin/bash
# Complete automation: Create site with analytics

set -e

SITE_NAME="$1"  # "Oakland Brainspotting Therapy"
SITE_SLUG="$2"  # "oakland-brainspotting-therapy"
DOMAIN="$3"     # "oaklandbrainspottingtherapy.com"

echo "🚀 Setting up new therapy site: ${SITE_NAME}"

# Step 1: Create Astro project
echo "📦 Creating Astro project..."
cd ~/Workspace/dk-sites
npm create astro@latest "${SITE_SLUG}" -- --template minimal --typescript strict --yes
cd "${SITE_SLUG}"

# Step 2: Install dependencies
echo "📦 Installing dependencies..."
npm install @astrojs/sitemap @tailwindcss/vite

# Step 3: Create GA4 property
echo "📊 Creating Google Analytics property..."
GA_ACCOUNT_ID="123456789"  # Your GA4 account ID
GA_OUTPUT=$(../scripts/create-ga4-property.sh "${SITE_NAME}" "${DOMAIN}" "${GA_ACCOUNT_ID}")
GA_MEASUREMENT_ID=$(echo "$GA_OUTPUT" | grep "GA_MEASUREMENT_ID=" | cut -d'=' -f2)

# Step 4: Create Facebook Pixel
echo "📱 Creating Facebook Pixel..."
FB_BUSINESS_ID="987654321"  # Your FB Business ID
FB_OUTPUT=$(../scripts/create-fb-pixel.sh "${SITE_NAME}" "${FB_BUSINESS_ID}")
FB_PIXEL_ID=$(echo "$FB_OUTPUT" | grep "FB_PIXEL_ID=" | cut -d'=' -f2)

# Step 5: Create .env file
echo "🔐 Creating environment variables..."
cat > .env << EOF
PUBLIC_GA_MEASUREMENT_ID=${GA_MEASUREMENT_ID}
PUBLIC_FB_PIXEL_ID=${FB_PIXEL_ID}
EOF

# Step 6: Add analytics tracking
echo "📈 Adding analytics tracking code..."
../scripts/add-analytics-tracking.sh "." "${GA_MEASUREMENT_ID}" "${FB_PIXEL_ID}"

# Step 7: Configure Astro
echo "⚙️  Configuring Astro..."
cat > astro.config.mjs << 'ASTROEOF'
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://DOMAIN_PLACEHOLDER',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()]
  }
});
ASTROEOF
sed -i '' "s|DOMAIN_PLACEHOLDER|${DOMAIN}|g" astro.config.mjs

echo ""
echo "✅ Site setup complete!"
echo ""
echo "📊 Analytics configured:"
echo "   Google Analytics: ${GA_MEASUREMENT_ID}"
echo "   Facebook Pixel: ${FB_PIXEL_ID}"
echo ""
echo "🚀 Next steps:"
echo "   1. cd ~/Workspace/dk-sites/${SITE_SLUG}"
echo "   2. npm run dev"
echo "   3. Build your content!"
```

**Usage:**
```bash
./scripts/setup-new-therapy-site.sh \
  "Oakland Grief Recovery" \
  "oakland-grief-recovery" \
  "oaklandgriefrecovery.com"
```

---

## Conversion Tracking (Event Tracking)

### Track Key Actions:

**Phone Click:**
```javascript
<!-- Add to phone links -->
<a href="tel:+15106940644"
   onclick="gtag('event', 'phone_click', { 'event_category': 'contact' }); fbq('track', 'Contact');">
  (510) 694-0644
</a>
```

**Booking Click:**
```javascript
<a href="https://booking-url.com"
   onclick="gtag('event', 'booking_click', { 'event_category': 'conversion' }); fbq('track', 'InitiateCheckout');">
  Book Consultation
</a>
```

**Form Submit:**
```javascript
<form onsubmit="gtag('event', 'form_submit', { 'event_category': 'lead' }); fbq('track', 'Lead');">
```

---

## Automated Deployment with Analytics

**Deploy script with verification:**

```bash
#!/bin/bash
# Deploy and verify analytics tracking

SITE_DIR="$1"

cd "${SITE_DIR}"

# Build
npm run build

# Verify analytics in build
if grep -q "gtag" dist/index.html && grep -q "fbq" dist/index.html; then
  echo "✅ Analytics tracking verified in build"
else
  echo "❌ Analytics tracking missing!"
  exit 1
fi

# Deploy
npx wrangler pages deploy dist --project-name="${PROJECT_NAME}"

# Verify live
LIVE_URL="https://${DOMAIN}"
sleep 5  # Wait for deployment

if curl -s "${LIVE_URL}" | grep -q "gtag"; then
  echo "✅ Analytics live on ${LIVE_URL}"
else
  echo "❌ Analytics not found on live site"
  exit 1
fi
```

---

## Dashboard Automation

### Create GA4 Dashboard via API:

```bash
# Set up standard dashboard for all therapy sites
# Includes:
# - Traffic sources
# - Top pages
# - Conversions (phone clicks, booking clicks)
# - Demographics
# - Devices

# Save as template, apply to new properties
```

---

## Environment Variables Strategy

**For multiple sites:**

```bash
# ~/.config/therapy-sites/analytics.conf
GA_ACCOUNT_ID="123456789"
FB_BUSINESS_ID="987654321"
FB_ACCESS_TOKEN="EAAxxxxxxxxxxxx"

# Per-site configs in each project:
# oakland-brainspotting/.env
PUBLIC_GA_MEASUREMENT_ID=G-ABC123
PUBLIC_FB_PIXEL_ID=123456

# oakland-grief-recovery/.env
PUBLIC_GA_MEASUREMENT_ID=G-XYZ789
PUBLIC_FB_PIXEL_ID=789012
```

---

## Testing Automation

**Test script before deploying:**

```bash
#!/bin/bash
# Test analytics in dev environment

npm run dev &
DEV_PID=$!
sleep 3

# Check if analytics loads
if curl -s http://localhost:4321 | grep -q "gtag"; then
  echo "✅ GA4 tracking code present"
else
  echo "❌ GA4 tracking code missing"
fi

if curl -s http://localhost:4321 | grep -q "fbq"; then
  echo "✅ Facebook Pixel code present"
else
  echo "❌ Facebook Pixel code missing"
fi

kill $DEV_PID
```

---

## Summary: Automation Checklist

For each new therapy landing page:

- [ ] Run `setup-new-therapy-site.sh`
- [ ] GA4 property created automatically
- [ ] Facebook Pixel created automatically
- [ ] Analytics tracking added to site
- [ ] Environment variables configured
- [ ] Build verification passes
- [ ] Deploy to Cloudflare Pages
- [ ] Live site verification passes
- [ ] Dashboard configured in GA4

**Time saved:** ~30 minutes per site (from 45 mins manual → 15 mins automated)

---

## Next Steps

1. **Test on Oakland Brainspotting** (do this manually first)
2. **Document any issues**
3. **Refine scripts**
4. **Use automation for Oakland Grief Recovery** (next site)
5. **Scale to all therapy landing pages**

---

**Status:** Ready to implement for Oakland Brainspotting (manual), then automate for future sites
