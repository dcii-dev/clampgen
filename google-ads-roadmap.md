# ClampGen Google Ads Roadmap

## Goal and Reality

Primary goal: drive qualified search traffic to ClampGen and convert visitors into engaged tool users.

Important reality: paid Google Ads does not directly increase organic rankings. This roadmap uses paid traffic to accelerate SEO by discovering high-intent queries and feeding them into on-page content strategy.

## Project Context Confirmed

This roadmap is based on the actual project at:

- `zzz_portfolio/ad-sites/asset-1-fluid-clamp/index.html`
- `zzz_portfolio/ad-sites/asset-1-fluid-clamp/js/app.js`

Site type:

- Utility tool, not lead-gen.
- No form submit or call-click primary actions.

Existing tracking:

- `gtag` is already installed in `index.html`.

Implemented event tracking in `app.js`:

- `clamp_css_copied`
- `type_scale_generated`
- `type_scale_copied`
- `preset_applied`
- `other_tools_click`

## Success Metrics

Primary conversion metrics:

- `clamp_css_copied`
- `type_scale_copied`

Secondary engagement metrics:

- `type_scale_generated`
- `preset_applied`
- `other_tools_click`

Business KPI targets for first 30 days:

- Stable flow of high-intent clicks from search terms relevant to CSS clamp usage.
- Rising counts of copy events (tool output usage).
- Lower wasted spend from irrelevant "clamp" hardware/tool queries.

## Phase 1: Tracking and Conversion Setup

1. Deploy the latest `js/app.js` to production.
2. Open GA4 DebugView and verify each event triggers correctly:
   - Copy button -> `clamp_css_copied`
   - Generate scale -> `type_scale_generated`
   - Copy all scale output -> `type_scale_copied`
   - Preset click -> `preset_applied`
   - Header external click -> `other_tools_click`
3. In GA4 Admin, mark key events:
   - Primary key events: `clamp_css_copied`, `type_scale_copied`
   - Secondary key events: `type_scale_generated`, `preset_applied`, `other_tools_click`
4. Link Google Ads to GA4.
5. Import GA4 key events into Google Ads conversions.
6. Keep conversion counting set to `One` for primary copy events.
7. Confirm auto-tagging is enabled in Google Ads account settings.

## Phase 2: Campaign Build (Search Only)

Campaign name suggestion:

- `ClampGen | Search | High Intent | EN`

Campaign settings:

1. Campaign type: Search only.
2. Disable Display Network expansion.
3. Locations: US, UK, CA, AU, NZ, IE (start tight).
4. Language: English.
5. Ad schedule: all day for launch period.
6. Bidding:
   - Week 1 to 2: Maximize Clicks with CPC cap.
   - After at least 30 primary conversions in 30 days: Maximize Conversions.

## Phase 3: Ad Group Structure

Use Exact and Phrase match only at launch.

### Ad Group 1: Core Clamp Intent

Keywords:

- [css clamp generator]
- [css clamp calculator]
- "css clamp generator"
- "clamp function css"

### Ad Group 2: Fluid Typography

Keywords:

- [fluid typography generator]
- [fluid font size clamp]
- "responsive typography calculator"
- "typography clamp calculator"

### Ad Group 3: Type Scale Intent

Keywords:

- [modular type scale generator]
- [fluid type scale generator]
- "css type scale calculator"

### Ad Group 4: Viewport and Container Intent

Keywords:

- [vw to clamp generator]
- [cqw clamp generator]
- "container query clamp calculator"

## Phase 4: Negative Keyword Foundation

Apply at campaign level on day one to prevent ambiguous clamp traffic:

- woodworking
- c clamp
- bar clamp
- hose clamp
- pipe clamp
- surgical clamp
- brake clamp
- phone clamp
- camera clamp
- table clamp
- harbor freight
- home depot
- lowes
- amazon
- walmart
- hardware
- tool
- tools

## Phase 5: Ad Creative Plan (RSA)

Create 2 RSAs per ad group.

Headline pool:

- CSS Clamp Generator
- Generate Fluid Typography CSS
- Clamp Formula Without Math
- Viewport and Container Support
- Copy Ready CSS in Seconds
- Type Scale Clamp Generator
- Free Clamp Calculator Tool
- Responsive CSS Made Easy

Description pool:

- Generate clamp declarations for font-size, spacing, and more. Copy and use instantly.
- Build fluid type scales with modular ratios and viewport or container units.
- Fast, free, no signup tool for responsive CSS clamp values.

Ad relevance rule:

- Pin one headline with the ad group's exact core query phrase.

## Phase 6: URL Tracking Standards

Set final URL suffix at campaign level:

`utm_source=google&utm_medium=cpc&utm_campaign=clampgen_search&utm_term={keyword}&utm_content={creative}`

Use this to connect query intent to on-site behavior in GA4.

## Phase 7: First 30 Days Optimization Cadence

Every 3 days:

1. Review Search Terms report.
2. Add irrelevant terms to negatives.
3. Pause terms with spend but no primary copy events.
4. Increase bids on terms with strong copy-event rate.

Weekly:

1. Export top converting terms by `clamp_css_copied` and `type_scale_copied`.
2. Feed those terms into SEO updates (page copy, FAQ, support pages).
3. Track matching organic terms in GSC for impressions, CTR, and position trend.

## SEO Flywheel Workflow

1. Paid search finds real high-intent terms.
2. GA4 event data validates which terms create meaningful engagement.
3. SEO content expands around those validated terms.
4. Organic visibility improves on proven topics.
5. Paid budget can gradually narrow to only strategic gaps.

## Launch Checklist

- [ ] Deploy updated `app.js` with event tracking.
- [ ] Verify all five events in GA4 DebugView.
- [ ] Mark key events in GA4.
- [ ] Link Google Ads and import conversions.
- [ ] Build Search-only campaign with 4 ad groups.
- [ ] Add campaign-level negative list.
- [ ] Create 2 RSAs per ad group.
- [ ] Set final URL suffix UTM template.
- [ ] Launch with controlled budget and CPC cap.
- [ ] Run first Search Terms cleanup within 72 hours.

## Optional Next Upgrade

After initial data quality is stable:

1. Add a dedicated landing page variant for "fluid typography generator" intent.
2. Create supporting SEO pages for top paid terms.
3. Test broad match in a separate experiment campaign with strict negative maintenance.
