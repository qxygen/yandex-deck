# Yandex Valuation Deck

Interactive presentation on **Yandex (YDEX)** built in **React + TypeScript + Vite**.

The deck presents a full equity-analysis narrative built around:
- business overview
- segment structure
- profitability and growth
- earnings quality
- reformulated statements
- residual earnings valuation
- market-implied expectations
- final investment view

The current investment conclusion in the deck is **Wait** under the default **hybrid earnings lens**.

---

## What this project is

This repository contains a standalone interactive presentation designed for:
- class presentation
- discussion with an investment-committee style audience
- scenario-based valuation walkthrough
- visual explanation of the logic behind the Yandex thesis

It is **not** a production investment tool and should be treated as an academic / analytical presentation.

---

## Presentation structure

The deck is organized as a sequence of slides:

1. **Business overview**  
   What Yandex does, why it is worth analyzing, and long-term stock-price context.

2. **Business structure**  
   Segment mix, revenue contribution, EBITDA contribution, and segment economics.

3. **Investment framing**  
   Why the stock looks different under reported, hybrid, and adjusted earnings bases.

4. **Financial momentum**  
   Revenue scale, operating leverage, margins, growth, and earnings quality trends.

5. **Earnings quality**  
   Reported → Hybrid → Adjusted bridge and the logic of the hybrid earnings base.

6. **Reformulated statements**  
   Operating assets, operating liabilities, financing assets, financing liabilities, NOA, and net financing debt.

7. **Profitability engine**  
   PM × ATO → RNOA → residual operating income.

8. **Residual earnings valuation**  
   Bear / base / bull valuation logic, no-growth anchor, and speculative premium.

9. **Market expectations**  
   Implied growth rate under reported, hybrid, and adjusted earnings lenses.

10. **Recommendation**  
    Final investment view and margin-of-safety logic.

11. **Appendix / explorer**  
    Additional reformulation and classification logic for Q&A.

---

## Core thesis

The deck argues that Yandex is a strong multi-vertical digital platform with a clear economic anchor in **Search & AI**, while the broader ecosystem adds scale and optionality. The main analytical question is whether the non-search businesses can sustain margin improvement over time.

The presentation therefore compares three earnings lenses:
- **Reported**
- **Hybrid**
- **Adjusted**

The **hybrid** lens is the working bridge between noisy reported earnings and more generous management-style adjustments.

---

## Tech stack

- **React**
- **TypeScript**
- **Vite**
- **Tailwind CSS**
- **Framer Motion**
- **Recharts**
- **Lucide React**

---

## Run locally

### 1. Install dependencies

```bash
npm install
```

### 2. Start development server

```bash
npm run dev
```

Then open the local URL shown in the terminal.

### 3. Build for production

```bash
npm run build
```

### 4. Preview production build

```bash
npm run preview
```

---

## Deployment

This project can be deployed easily on **Vercel**.

### Recommended settings
- Framework preset: **Vite**
- Build command: `npm run build`
- Output directory: `dist`

If deploying from GitHub:
1. Push the repository to GitHub
2. Import the repo into Vercel
3. Keep the default Vite settings
4. Deploy

---

## Presentation controls

Keyboard navigation is built into the deck.

### Navigation
- `→` / `PageDown` — next slide
- `←` / `PageUp` — previous slide
- numeric keys — jump directly to a slide  
  Example: press `1` then `0` to jump to slide 10

### In-slide interaction
Some slides contain:
- basis switches
- scenario buttons
- chart mode switches
- valuation assumption sliders

These are designed for live presentation and Q&A.

---

## Data and valuation conventions

The deck is based on the valuation framework developed for the Yandex project and uses a fixed market snapshot and embedded presentation assumptions.

The repo version should therefore be treated as a **presentation artifact**, not as a live market dashboard.

---

## Earnings bases used in the deck

### Reported
Pure IFRS-based earnings.

### Hybrid
Analytical earnings base:
- removes obvious FX and one-off noise
- keeps SBC as a real economic expense
- serves as the main working valuation lens

### Adjusted
Management-style cleaner earnings base with broader add-backs.

---

## Valuation logic

The presentation relies primarily on **residual earnings valuation** and **implied-growth analysis**.

Key ideas:
- start from book value
- add residual earnings
- separate **anchored value** from **speculative value**
- compare what the stock implies under different earnings lenses

---

## Notes on interpretation

This deck is intentionally selective. It is designed to communicate:
- how the business works
- where the economic engine sits
- how accounting choices affect valuation
- why the final view is **Wait**, not automatically **Buy**

The goal is not to show every possible metric, but to present a coherent argument.

---

## Repository contents

Typical contents include:
- `src/App.tsx` — main presentation logic
- `public/` — static assets such as QR code or images
- `package.json` — project dependencies and scripts
- Vite / TypeScript config files
- generated report and Excel model stored separately

---

## Usage recommendation

For live presentation:
1. Run the deck locally or deploy to Vercel
2. Open in full-screen mode
3. Use keyboard shortcuts for navigation
4. Use valuation and basis controls only when needed
5. Keep the appendix slide for Q&A rather than the main flow

---

## Disclaimer

This repository was created for academic analysis and presentation purposes.  
It does not constitute investment advice, portfolio advice, or a recommendation to buy or sell securities.

---
