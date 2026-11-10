# Content visibility contract

The contract is a structured view of supplemental entries in `business_model.content_graph`. It prevents two opposite failures: explanatory copy that compensates for weak structure, and critical business meaning that is removed or hidden for visual cleanliness.

Primary headings, visible labels, actions and raw business data keep their ordinary source and ownership metadata. Only supplemental or disclosed content needs the visibility fields below.

```json
{
  "schema": 1,
  "required_states": ["default", "error"],
  "entries": [
    {
      "key": "renewal-consequence",
      "kind": "risk",
      "source": "billing-policy",
      "owner": "billing",
      "purpose": "risk",
      "criticality": "critical",
      "audience": "all",
      "timing": "before-action",
      "delivery": "visible",
      "irreducible_fact": "The plan renews and charges automatically at the end of the term.",
      "structure_attempt": "The switch state can show enabled or disabled but cannot express the future charge."
    }
  ]
}
```

`criticality`, `audience` and `timing` constrain delivery. Critical or universal information stays `visible` or `inline-hint`. A tooltip is valid only for short, optional, minority-needed, on-demand, non-interactive information.

## Prototype linkage

Visible content uses `data-content-key`. Supplemental content also declares its rendered role and delivery so lint can compare the DOM with the contract.

```html
<p
  data-content-key="renewal-consequence"
  data-content-role="risk"
  data-content-delivery="visible"
>
  到期后自动续费并扣款
</p>
```

A web tooltip uses a focusable trigger, an accessible name and `aria-describedby`. The tooltip stays text-only; links or buttons require a disclosure or popover instead.

```html
<button aria-label="查看账期定义" aria-describedby="billing-term-tip">i</button>
<div
  id="billing-term-tip"
  role="tooltip"
  data-content-key="billing-term-definition"
  data-content-role="definition"
  data-content-delivery="tooltip"
>
  账期是本次结算覆盖的日期范围
</div>
```

Static linkage does not prove runtime behavior. Verify focus and hover entry, touch alternative, Escape dismissal, hover persistence, focus return and assistive-technology announcement with runtime evidence.

## Tooling

```bash
node scripts/content-lint.mjs path/to/prototype --manifest path/to/content-contract.json
```

The validator reports contract errors separately from duplicate-copy and DOM-relationship warnings. It deliberately does not set a word-count or text-density target.
