import MuiList from "@mui/material/List"
import MuiListItem from "@mui/material/ListItem"
import MuiListItemIcon from "@mui/material/ListItemIcon"
import MuiListItemText from "@mui/material/ListItemText"
import MuiDivider from "@mui/material/Divider"
import MuiIconButton from "@mui/material/IconButton"
import { Ellipsis, Inbox, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@/components/ui/item"
import type { Section } from "../types"

// shadcn has no component called List: its twin for MUI's List family is Item / ItemGroup, whose
// ItemGroup is a `role="list"` column of Items and whose ItemContent + ItemTitle + ItemDescription
// carry exactly what MUI's ListItemText renders as primary and secondary.
//
// Both sides are `w-full`, so the pair needs an outer box with a real width.
const wrapStyle = { width: "16rem" } as const

// SIZES. shadcn's Item has three (`default`, `sm`, `xs`); MUI has one boolean, `dense`. They cannot
// map one to one, so the mapping is a decision and is recorded here rather than left implicit.
//
// `dense` maps to `xs`, not to `sm`, because of WHAT each one changes. shadcn's `sm` is
// byte-identical to `default` at the item (`gap-2.5 px-3 py-2.5` both); the only difference is the
// GROUP's gap. `xs` is the size that tightens the item's own padding (`gap-2 px-2.5 py-2`), which is
// exactly what MUI's `dense` does - it takes a ListItem's vertical padding from 8px to 4px. Mapping
// dense to `sm` would mean a prop named for compactness that left the item's padding alone.
//
// `sm` therefore has no MUI expression and is not themed. Neither are Item's `outline` and `muted`
// VARIANTS: MUI's ListItem has no variant prop at all, so a consumer wanting a bordered list item
// reaches for sx or a styled component, which is app-level work and not something a theme can own.
// Both are recorded in the README's surface table rather than silently missing.

export const listSection: Section = {
  title: "List",
  pairs: [
    {
      id: "list-basic",
      states: ["default"],
      shadcn: (
        <div style={wrapStyle}>
          <ItemGroup>
            <Item data-target>
              <ItemContent>
                <ItemTitle>Inbox</ItemTitle>
              </ItemContent>
            </Item>
            <Item>
              <ItemContent>
                <ItemTitle>Sent</ItemTitle>
              </ItemContent>
            </Item>
          </ItemGroup>
        </div>
      ),
      mui: (
        <div style={wrapStyle}>
          <MuiList>
            <MuiListItem data-target>
              <MuiListItemText primary="Inbox" />
            </MuiListItem>
            <MuiListItem>
              <MuiListItemText primary="Sent" />
            </MuiListItem>
          </MuiList>
        </div>
      ),
    },
    {
      // Icon but no description: ItemMedia stays vertically centred. The item WITH a description is
      // a separate pair below, because shadcn moves the media when one is present.
      id: "list-icon",
      states: ["default"],
      shadcn: (
        <div style={wrapStyle}>
          <ItemGroup>
            <Item data-target>
              <ItemMedia variant="icon">
                <Inbox />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Inbox</ItemTitle>
              </ItemContent>
            </Item>
            <Item>
              <ItemMedia variant="icon">
                <Send />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Sent</ItemTitle>
              </ItemContent>
            </Item>
          </ItemGroup>
        </div>
      ),
      mui: (
        <div style={wrapStyle}>
          <MuiList>
            <MuiListItem data-target>
              <MuiListItemIcon>
                <Inbox />
              </MuiListItemIcon>
              <MuiListItemText primary="Inbox" />
            </MuiListItem>
            <MuiListItem>
              <MuiListItemIcon>
                <Send />
              </MuiListItemIcon>
              <MuiListItemText primary="Sent" />
            </MuiListItem>
          </MuiList>
        </div>
      ),
    },
    {
      id: "list-description",
      states: ["default"],
      // no icon - the icon-plus-description case is its own pair below
      shadcn: (
        <div style={wrapStyle}>
          <ItemGroup>
            <Item data-target>
              <ItemContent>
                <ItemTitle>Inbox</ItemTitle>
                <ItemDescription>12 unread</ItemDescription>
              </ItemContent>
            </Item>
            <Item>
              <ItemContent>
                <ItemTitle>Sent</ItemTitle>
                <ItemDescription>Last week</ItemDescription>
              </ItemContent>
            </Item>
          </ItemGroup>
        </div>
      ),
      mui: (
        <div style={wrapStyle}>
          <MuiList>
            <MuiListItem data-target>
              <MuiListItemText primary="Inbox" secondary="12 unread" />
            </MuiListItem>
            <MuiListItem>
              <MuiListItemText primary="Sent" secondary="Last week" />
            </MuiListItem>
          </MuiList>
        </div>
      ),
    },
    {
      // Icon AND description together, which is not just the two previous pairs stacked. shadcn
      // moves the media when a description is present - `group-has-data-[slot=item-description]/item`
      // switches it to `self-start` and nudges it down `translate-y-0.5` - so the icon stops being
      // vertically centred on the whole item and instead aligns to the title's line. MUI keeps its
      // icon centred, so without this pair the two would drift apart exactly when a list gets its
      // most common real-world shape.
      id: "list-icon-description",
      states: ["default"],
      shadcn: (
        <div style={wrapStyle}>
          <ItemGroup>
            <Item data-target>
              <ItemMedia variant="icon">
                <Inbox />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Inbox</ItemTitle>
                <ItemDescription>12 unread</ItemDescription>
              </ItemContent>
            </Item>
            <Item>
              <ItemMedia variant="icon">
                <Send />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Sent</ItemTitle>
                <ItemDescription>Last week</ItemDescription>
              </ItemContent>
            </Item>
          </ItemGroup>
        </div>
      ),
      mui: (
        <div style={wrapStyle}>
          <MuiList>
            <MuiListItem data-target>
              <MuiListItemIcon>
                <Inbox />
              </MuiListItemIcon>
              <MuiListItemText primary="Inbox" secondary="12 unread" />
            </MuiListItem>
            <MuiListItem>
              <MuiListItemIcon>
                <Send />
              </MuiListItemIcon>
              <MuiListItemText primary="Sent" secondary="Last week" />
            </MuiListItem>
          </MuiList>
        </div>
      ),
    },
    {
      // A trailing action. shadcn's ItemActions is an ordinary flex child at the end of the item,
      // pushed right by ItemContent's flex-1; MUI's `secondaryAction` is positioned ABSOLUTELY at
      // the row's right edge and lifted with a translate. Those are different objects that happen to
      // look alike, and the theme has to make MUI's the shadcn one - see the MuiListItem block.
      id: "list-actions",
      states: ["default"],
      shadcn: (
        <div style={wrapStyle}>
          <ItemGroup>
            <Item data-target>
              <ItemContent>
                <ItemTitle>Inbox</ItemTitle>
              </ItemContent>
              <ItemActions>
                <Button variant="ghost" size="icon-sm" aria-label="More">
                  <Ellipsis />
                </Button>
              </ItemActions>
            </Item>
          </ItemGroup>
        </div>
      ),
      mui: (
        <div style={wrapStyle}>
          <MuiList>
            <MuiListItem
              data-target
              secondaryAction={
                <MuiIconButton size="small" aria-label="More">
                  <Ellipsis />
                </MuiIconButton>
              }
            >
              <MuiListItemText primary="Inbox" />
            </MuiListItem>
          </MuiList>
        </div>
      ),
    },
    {
      // A rule between items. shadcn's ItemSeparator is its Separator with `my-2`; MUI's equivalent
      // inside a list is a Divider rendered as an `li`, which is what a consumer writes so the list
      // markup stays valid. Both are the same 1px rule the Divider pairs already cover - what is new
      // here is the 8px it takes above and below.
      id: "list-separator",
      states: ["default"],
      shadcn: (
        <div style={wrapStyle}>
          <ItemGroup>
            <Item data-target>
              <ItemContent>
                <ItemTitle>Inbox</ItemTitle>
              </ItemContent>
            </Item>
            <ItemSeparator />
            <Item>
              <ItemContent>
                <ItemTitle>Sent</ItemTitle>
              </ItemContent>
            </Item>
          </ItemGroup>
        </div>
      ),
      mui: (
        <div style={wrapStyle}>
          <MuiList>
            <MuiListItem data-target>
              <MuiListItemText primary="Inbox" />
            </MuiListItem>
            <MuiDivider component="li" />
            <MuiListItem>
              <MuiListItemText primary="Sent" />
            </MuiListItem>
          </MuiList>
        </div>
      ),
    },
    {
      // The compact size. `dense` on the List is what a consumer writes; MUI propagates it to the
      // items through context, so neither ListItem needs the prop itself.
      id: "list-dense",
      states: ["default"],
      shadcn: (
        <div style={wrapStyle}>
          <ItemGroup>
            <Item data-target size="xs">
              <ItemContent>
                <ItemTitle>Inbox</ItemTitle>
              </ItemContent>
            </Item>
            <Item size="xs">
              <ItemContent>
                <ItemTitle>Sent</ItemTitle>
              </ItemContent>
            </Item>
          </ItemGroup>
        </div>
      ),
      mui: (
        <div style={wrapStyle}>
          <MuiList dense>
            <MuiListItem data-target>
              <MuiListItemText primary="Inbox" />
            </MuiListItem>
            <MuiListItem>
              <MuiListItemText primary="Sent" />
            </MuiListItem>
          </MuiList>
        </div>
      ),
    },
  ],
}
