import MuiList from "@mui/material/List"
import MuiListItem from "@mui/material/ListItem"
import MuiListItemIcon from "@mui/material/ListItemIcon"
import MuiListItemText from "@mui/material/ListItemText"
import { Inbox, Send } from "lucide-react"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import type { Section } from "../types"

// shadcn has no component called List: its twin for MUI's List family is Item / ItemGroup, whose
// ItemGroup is a `role="list"` column of Items and whose ItemContent + ItemTitle + ItemDescription
// carry exactly what MUI's ListItemText renders as primary and secondary.
//
// Both sides are `w-full`, so the pair needs an outer box with a real width.
const wrapStyle = { width: "16rem" } as const

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
  ],
}
