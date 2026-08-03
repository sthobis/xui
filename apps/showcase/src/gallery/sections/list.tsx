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
      ref: (
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
      // Icon but no description: shadcn's ItemMedia only shifts to `self-start` plus a half-step
      // translate when the item HAS a description, and that alignment shift has no pair, so this
      // one keeps the plain centred case.
      id: "list-icon",
      states: ["default"],
      ref: (
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
      ref: (
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
  ],
}
