# Google Business Profile API Setup

**Date:** November 5, 2025
**Status:** Quota limits require manual intervention
**For:** SMB service package automation

---

## Current Situation

The Google Business Profile (GBP) API is now working with proper authentication, but Google sets quota limits to **0 requests/minute** by default for new projects.

### What We Accomplished

1. ✅ **Authentication configured** with proper scopes:
   - `https://www.googleapis.com/auth/business.manage`
   - `https://www.googleapis.com/auth/analytics.edit`
   - `https://www.googleapis.com/auth/analytics.readonly`
   - `https://www.googleapis.com/auth/cloud-platform`

2. ✅ **APIs enabled** in GCP project:
   - `mybusinessaccountmanagement.googleapis.com`
   - `mybusinessbusinessinformation.googleapis.com`

3. ✅ **Quota project set**: `project-megan-gr-1721845059860`

4. ❌ **Quota limit**: Currently 0 requests/minute (Google default for new API enablement)

---

## Error Message

```json
{
  "error": {
    "code": 429,
    "message": "Quota exceeded for quota metric 'Requests' and limit 'Requests per minute' of service 'mybusinessaccountmanagement.googleapis.com' for consumer 'project_number:265699206243'.",
    "status": "RESOURCE_EXHAUSTED",
    "quota_limit_value": "0"
  }
}
```

---

## Options to Proceed

### Option 1: Request Quota Increase (Recommended for production)

**For production SMB service:**

1. Visit https://console.cloud.google.com/apis/api/mybusinessaccountmanagement.googleapis.com/quotas?project=project-megan-gr-1721845059860
2. Click "Edit Quotas"
3. Request increase for "Requests per minute per project"
4. Justification: "Automated GBP management for small business clients"
5. Google typically approves within 24-48 hours

**Suggested quota request:**
- 60 requests/minute (sufficient for 10-20 client updates per automation run)
- 10,000 requests/day

### Option 2: Manual GBP Updates (Current workaround)

For now, update Megan's GBP manually at https://business.google.com/:

1. Select business at 3637 Grand Ave, Oakland
2. Edit profile → Links section
3. Add additional link:
   - **Link text:** "Oakland Brainspotting Therapy"
   - **URL:** https://oaklandbrainspottingtherapy.com
4. Save

### Option 3: Alternative API Approaches

**Google My Business API v4** (deprecated, 404 errors)
**Business Profile Performance API** (read-only, for analytics not updates)

---

## For Future SMB Automation

### Recommended Setup

When setting up GBP automation for your SMB service package:

1. **Create dedicated GCP project** for SMB services
2. **Request quota increases BEFORE** onboarding clients
3. **Expected quotas needed:**
   - 100+ requests/minute if managing 50+ client locations
   - 50,000+ requests/day for batch operations

### Cost Estimate

GBP API usage is **free** but requires:
- GCP project (free tier covers API calls)
- Quota approval (manual process)

### Implementation Timeline

- **Quota request:** Submit today
- **Approval time:** 24-48 hours typical
- **API integration:** 2-4 hours development
- **Testing:** 1-2 hours per client type

---

## Authentication Commands (For Reference)

```bash
# Re-authenticate with proper scopes
gcloud auth application-default login \
  --scopes=https://www.googleapis.com/auth/business.manage,https://www.googleapis.com/auth/analytics.edit,https://www.googleapis.com/auth/analytics.readonly,https://www.googleapis.com/auth/cloud-platform

# Set quota project
gcloud auth application-default set-quota-project project-megan-gr-1721845059860

# Enable APIs
gcloud services enable mybusinessaccountmanagement.googleapis.com --project=project-megan-gr-1721845059860
gcloud services enable mybusinessbusinessinformation.googleapis.com --project=project-megan-gr-1721845059860

# Test API call (will fail until quota approved)
TOKEN=$(gcloud auth application-default print-access-token)
curl -H "Authorization: Bearer $TOKEN" \
  -H "x-goog-user-project: project-megan-gr-1721845059860" \
  "https://mybusinessaccountmanagement.googleapis.com/v1/accounts"
```

---

## Next Steps

**Immediate (Manual):**
- [ ] Update Megan's GBP manually with oaklandbrainspottingtherapy.com link

**For SMB Service Package:**
- [ ] Request quota increase for GBP APIs
- [ ] Create automation scripts once quota approved
- [ ] Document workflow in `~/.claude/playbooks/gbp-automation.md`
- [ ] Test with Megan's profile as pilot
- [ ] Scale to other SMB clients

---

## Related Documentation

- **Analytics Playbook:** `~/.claude/playbooks/install-analytics-therapy-sites.md`
- **GTM Setup:** `GTM-SETUP-GUIDE.md`
- **Keyword Strategy:** `KEYWORD-CLUSTERING-STRATEGY.md`

