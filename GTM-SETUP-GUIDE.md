# Google Tag Manager Setup for Oakland Brainspotting

**Date:** November 5, 2025
**Site:** oaklandbrainspottingtherapy.com
**Strategy:** Use GTM to manage GA4 + Facebook Pixel + future tags

---

## Step 1: Create GTM Container

1. Go to https://tagmanager.google.com/
2. Click **Create Account**
3. Fill in:
   - **Account Name:** "Dean Keesey / Megan Gredesky Therapy Sites"
   - **Country:** United States
   - Click **Continue**
4. Container Setup:
   - **Container name:** "Oakland Brainspotting Therapy"
   - **Target platform:** Web
   - Click **Create**
5. Accept Terms of Service
6. **Copy the GTM Container ID** (looks like `GTM-XXXXXXX`)

---

## Step 2: Configure GA4 Tag in GTM

### Add GA4 Configuration Tag:

1. In GTM, click **Tags** → **New**
2. Click tag configuration area
3. Choose **Google Analytics: GA4 Configuration**
4. Fill in:
   - **Measurement ID:** `G-H4843GTPTX` (your GA4 ID)
5. Click **Triggering**
6. Select **All Pages**
7. Name tag: "GA4 - Configuration"
8. Click **Save**

---

## Step 3: Add Facebook Pixel Tag in GTM

### Add Facebook Pixel Tag:

1. Click **Tags** → **New**
2. Click tag configuration
3. Choose **Custom HTML**
4. Paste this code:

```html
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', 'YOUR_PIXEL_ID_HERE');
fbq('track', 'PageView');
</script>
<noscript>
<img height="1" width="1" style="display:none"
  src="https://www.facebook.com/tr?id=YOUR_PIXEL_ID_HERE&ev=PageView&noscript=1" />
</noscript>
```

5. **Replace** `YOUR_PIXEL_ID_HERE` with actual Facebook Pixel ID
6. Click **Triggering** → **All Pages**
7. Name tag: "Facebook Pixel - Base Code"
8. Click **Save**

---

## Step 4: Add Conversion Tracking Tags

### Phone Click Event:

1. **Create Trigger:**
   - **Triggers** → **New**
   - Type: **Click - All Elements**
   - Name: "Phone Click"
   - Fire on: **Some Clicks**
   - Condition: `Click URL` contains `tel:`
   - Save

2. **Create GA4 Event Tag:**
   - **Tags** → **New**
   - Type: **Google Analytics: GA4 Event**
   - Configuration Tag: Select "GA4 - Configuration"
   - Event Name: `phone_click`
   - Trigger: Select "Phone Click"
   - Name: "GA4 - Phone Click Event"
   - Save

3. **Create Facebook Event Tag:**
   - **Tags** → **New**
   - Type: **Custom HTML**
   - HTML: `<script>fbq('track', 'Contact');</script>`
   - Trigger: Select "Phone Click"
   - Name: "Facebook Pixel - Contact Event"
   - Save

### Booking Click Event:

1. **Create Trigger:**
   - **Triggers** → **New**
   - Type: **Click - All Elements**
   - Name: "Booking Click"
   - Fire on: **Some Clicks**
   - Condition: `Click URL` contains `clientsecure.me`
   - OR: `Click Text` contains `Schedule`
   - Save

2. **Create GA4 Event Tag:**
   - **Tags** → **New**
   - Type: **Google Analytics: GA4 Event**
   - Configuration Tag: Select "GA4 - Configuration"
   - Event Name: `booking_click`
   - Trigger: Select "Booking Click"
   - Name: "GA4 - Booking Click Event"
   - Save

3. **Create Facebook Event Tag:**
   - **Tags** → **New**
   - Type: **Custom HTML**
   - HTML: `<script>fbq('track', 'InitiateCheckout');</script>`
   - Trigger: Select "Booking Click"
   - Name: "Facebook Pixel - Initiate Checkout"
   - Save

---

## Step 5: Test in Preview Mode

1. Click **Preview** button (top right)
2. Enter: `http://localhost:4323` (or live URL)
3. Click **Connect**
4. In preview window:
   - Check **Tags Fired** shows GA4 + Facebook Pixel
   - Click phone number → See phone_click events fire
   - Click booking button → See booking_click events fire
5. If all working, click **Continue** to exit preview

---

## Step 6: Publish Container

1. Click **Submit** (top right)
2. Version name: "Initial Setup - GA4 + Facebook Pixel"
3. Description: "GA4 config, FB Pixel, phone & booking conversion tracking"
4. Click **Publish**

---

## Step 7: Verify on Live Site

1. Deploy site with GTM code
2. Visit live URL
3. Open browser console
4. Check:
   - `dataLayer` exists
   - `gtag` function exists
   - `fbq` function exists
5. Click phone → Check Network tab for events
6. Check GA4 Realtime to see yourself

---

## GTM Container Summary

**Container ID:** GTM-XXXXXXX (replace with yours)

**Tags Configured:**
1. GA4 Configuration (All Pages)
2. Facebook Pixel Base Code (All Pages)
3. GA4 Phone Click Event (Phone links)
4. FB Contact Event (Phone links)
5. GA4 Booking Click Event (Booking buttons)
6. FB InitiateCheckout Event (Booking buttons)

**Triggers:**
1. All Pages
2. Phone Click (tel: links)
3. Booking Click (booking URLs/text)

---

## Future Tags (Easy to Add via GTM)

- Email click tracking
- Scroll depth tracking
- Form submission tracking
- Video engagement
- External link clicks
- File downloads
- Any other pixel/tag

---

## Benefits of This Setup

✅ **Centralized:** All tracking in one place
✅ **No code changes:** Add/modify tags in GTM UI
✅ **Version control:** GTM tracks all changes
✅ **Debug mode:** Built-in preview and debugging
✅ **Flexible:** Easy to add new tags/pixels
✅ **Professional:** Industry standard approach

---

**Status:** Ready to implement once GTM container is created
