import { useState } from "react"
import MuiTabs from "@mui/material/Tabs"
import MuiTab from "@mui/material/Tab"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Section } from "../../../gallery/types"

// shadcn's <Tabs> root (data-slot="tabs") carries `flex gap-2 data-horizontal:flex-col` -
// for the default horizontal orientation this is a COLUMN flex (list stacked above content),
// not a row - `data-horizontal:` is shadcn's own custom Tailwind variant compiling to
// `[data-orientation="horizontal"]` (see node_modules/shadcn/dist/tailwind.css), and the
// component always sets `data-orientation="horizontal"` by default. MUI's <Tabs> only themes
// the tab bar itself (root/scroller/list/indicator) - it has no notion of a sibling content
// panel - so this outer column-with-gap layout is recreated here as a plain wrapping div,
// exactly like every other section's `<div style={...}>` composition wrapper (see
// divider.tsx/radio.tsx/slider.tsx), not a themed component.
const tabsRootStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem", // shadcn: gap-2
  width: "16rem",
} as const

// shadcn's TabsContent (data-slot="tabs-content") is `flex-1 text-sm outline-none`. MUI ships
// no core TabPanel (that lives in @mui/lab, out of scope - see apps/showcase/package.json,
// no @mui/lab dependency), so the MUI side's panel is plain markup restating the same text-sm
// sizing, not a themed MUI component.
const panelStyle = {
  flex: 1,
  fontSize: "0.875rem", // shadcn: text-sm
  lineHeight: 1.25 / 0.875, // shadcn: text-sm line-height (calc(1.25/0.875))
  outline: "none",
} as const

// MUI's Tabs is controlled - with a `value` and no `onChange` the tabs render but do not respond to
// clicks. shadcn's side is uncontrolled (`defaultValue`), so it switched while the twin sat inert.
// The state lives here rather than in the theme because it is how any MUI app wires Tabs; the pair
// still starts on "password" so every capture is unchanged.
function MuiTabsDemo() {
  const [value, setValue] = useState("password")
  return (
    <div style={tabsRootStyle}>
      <MuiTabs value={value} onChange={(_, next: string) => setValue(next)}>
        <MuiTab data-target value="account" label="Account" />
        <MuiTab value="password" label="Password" />
      </MuiTabs>
      <div style={panelStyle}>
        {value === "password" ? "Change your password here." : "Manage your account here."}
      </div>
    </div>
  )
}

export const tabsSection: Section = {
  title: "Tabs",
  pairs: [
    {
      id: "tabs-basic",
      // data-target sits on the INACTIVE trigger ("Account") rather than the active one, since
      // shadcn's hover rule on an inactive trigger (hover:text-foreground) is the one with a
      // visible pixel delta from the default state - the active trigger's hover:text-foreground
      // is already a no-op (it's already text-foreground).
      //
      // GOTCHA - "focus" is deliberately NOT in this list, and this is a real, traced JS/DOM
      // behavior difference between the two tab primitives, not a themeable CSS gap. Radix's
      // Tabs (apps/showcase/src/components/ui/tabs.tsx) uses @radix-ui/react-roving-focus with
      // no `defaultCurrentTabStopId`, so EVERY trigger starts at tabIndex -1 until the user has
      // already arrow-keyed within the group (confirmed live: both triggers read tabIndex -1 on
      // first render) - only the group root and the always-tabbable TabsContent panel
      // (`role="tabpanel" tabIndex={0}`, unconditional in @radix-ui/react-tabs) are real Tab
      // stops. A fresh keyboard Tab into this component therefore lands on the CONTENT PANEL
      // (`outline-none`, no ring class), not on any trigger - verified live with a real Tab
      // keypress (document.activeElement ended up on `[data-slot=tabs-content]`,
      // `:focus-visible` true, zero visible change). MUI's Tab, by contrast, keeps its
      // roving tabindex "eager": the SELECTED tab is tabIndex 0 from first render (verified:
      // Account -1, Password 0) - a real Tab keypress lands directly on the Password button and
      // shows our themed focus ring, with no MUI-only equivalent of Radix's always-there
      // tabpanel stop positioned earlier in the DOM to intercept it. The two frameworks
      // genuinely disagree on where a fresh Tab-key press lands; no CSS override changes that,
      // and the harness's single generic per-pair `data-target` can't reconcile both real
      // behaviors with one probe position. Out of scope for this pair.
      states: ["default", "hover"],
      ref: (
        <Tabs defaultValue="password" style={tabsRootStyle}>
          <TabsList>
            <TabsTrigger data-target value="account">
              Account
            </TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
          </TabsList>
          <TabsContent value="account">Manage your account here.</TabsContent>
          <TabsContent value="password">Change your password here.</TabsContent>
        </Tabs>
      ),
      mui: <MuiTabsDemo />,
    },
  ],
}
