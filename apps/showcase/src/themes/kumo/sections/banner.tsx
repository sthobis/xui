import MuiAlert from "@mui/material/Alert"
import { Banner } from "@cloudflare/kumo/components/banner"
import type { Section } from "../../../gallery/types"

// kumo: Banner is `flex w-full` plus its size row (`items-start gap-3 rounded-lg px-4 py-3
// text-base`), and each variant is a tint background with matching text:
//   default -> info, alert -> warning, error -> danger
// MUI's severities line up with those three exactly.

export const bannerSection: Section = {
  title: "Banner",
  pairs: [
    {
      id: "banner-default",
      ref: <Banner>This is a default banner.</Banner>,
      mui: <MuiAlert severity="info">This is a default banner.</MuiAlert>,
    },
    {
      id: "banner-alert",
      ref: <Banner variant="alert">This is an alert banner.</Banner>,
      mui: <MuiAlert severity="warning">This is an alert banner.</MuiAlert>,
    },
    {
      id: "banner-error",
      ref: <Banner variant="error">This is an error banner.</Banner>,
      mui: <MuiAlert severity="error">This is an error banner.</MuiAlert>,
    },
  ],
}
