<h1 align="center">QS Design</h1>

<p align="center">Business-conditioned, context-isolated product design for coding agents.</p>

<p align="center"><strong>English</strong> · <a href="./README.zh-CN.md">简体中文</a></p>

QS Design turns fuzzy business language into distinctive, platform-native and verifiable product experiences. It treats the design task—not a project folder—as the context root, so it works for both chat-only concept work and changes inside an existing product.

## Showcase

The examples below do not share a visual template. Each interface is shaped by its own core object, state changes, operating rhythm and risk. Open [`showcase/index.html`](./showcase/index.html) after cloning the repository to browse the interactive pages.

### Batchline · bake-day production

Fermentation stages, dough state and oven recovery determine the page topology. Selecting a batch reveals the next physical action and the measurements needed at that moment.

[Interactive HTML source](./showcase/batchline.html)

![Batchline bake-day production interface](./showcase/previews/batchline.png)

### Relay · grid restoration

The feeder network is the primary interface. Energization, isolation and field clearance remain spatially connected to the switching sequence and affected homes.

[Interactive HTML source](./showcase/relay.html)

![Relay grid restoration interface](./showcase/previews/relay.png)

### Folio · manuscript conservation

The artifact stays central. Condition findings remain attached to exact locations on the leaf while treatment order and handling restrictions stay visible.

[Interactive HTML source](./showcase/folio.html)

![Folio manuscript conservation interface](./showcase/previews/folio.png)

## What it does

- Uses one `$qs-design` entry point and routes internally to iOS, Android, Web, WeChat Mini Program and Alipay Mini Program capabilities.
- Works without a project folder and supports incremental design or refactoring inside an existing product.
- Uses a Task Capsule to isolate rejected concepts and unauthorized history; only explicitly named candidate aspects can be inherited.
- Freezes a source-backed Product Truth with primary jobs, critical journeys, known routes and states, a visible-affordance allowlist, forbidden inventions and explicit unknowns.
- Uses an Attention Contract to keep one first-viewport task dominant, and a Terminology Contract to catch labels that predict the wrong destination before helper copy is added.
- Explores one to three directions according to real uncertainty instead of producing fixed variants or color swaps.
- Derives page topology, visual priority, core modules and signature interactions from business objects, relationships, states, risks and value moments.
- Uses a continuity contract to decide what an existing product must preserve, adapt, leave open or prohibit.
- Makes layout, hierarchy, spacing, real data and clear actions explain the interface before adding supporting copy.
- Keeps amounts, permissions, risks, constraints, consequences and recovery visible; tooltips are reserved for short, optional and non-interactive information.
- Matches specimen, static, clickable or native prototype fidelity to fixed paths, states, fixtures and evidence; a screenshot cannot claim an interaction passed.
- Treats design, optimization, visual-improvement and refactoring requests as design work even when phrased as questions. Design mode renders and embeds a directly viewable preview for every formal direction; prose, tables and ASCII alone are not a design delivery.
- Converts feedback into bounded preserve/change/do-not-infer experiments and protects untouched approved elements with stable identities and mutation scopes.
- Expands a selected representative flow through a route-aware propagation map instead of repeating one page template across the product.
- Verifies keyboard, touch, screen reader, text scaling, reduced motion, failure states, performance, asset provenance and platform degradation.

## Install and use

Node.js 22.20 or newer is required. The repository installs a single `qs-design` skill containing the shared engine, platform adapters, interaction tools and verification contracts.

### Codex

```bash
npx skills add yuanqishen666/QS-Design --skill qs-design -g -a codex -y
```

### Cursor

```bash
npx skills add yuanqishen666/QS-Design --skill qs-design -g -a cursor -y
```

### Claude Code

```bash
npx skills add yuanqishen666/QS-Design --skill qs-design -g -a claude-code -y
```

If you previously installed `qs-ios-design`, remove the old entry before installing the current version:

```bash
npx skills remove qs-ios-design -g -a codex -y
```

Update an existing installation with:

```bash
npx skills update qs-design -g -y
```

Restart the tool or begin a new chat after installation. Use `$qs-design` for every platform and state the target platform in the request:

```text
Use $qs-design to design the iOS, Android and Web home screens for my expense-tracking product.
```

You can also attach screenshots, product notes or an existing codebase. QS Design starts directly when the available information is sufficient and asks only when a missing decision would change the primary task or visual direction.
