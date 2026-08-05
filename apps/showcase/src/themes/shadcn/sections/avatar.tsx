import MuiAvatar from "@mui/material/Avatar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Section } from "../../../gallery/types"

// A stable inline SVG data URI so both sides load the identical bitmap with no network
// dependency - two-tone so object-fit: cover cropping to a circle is visually verifiable,
// not just a flat color that would hide a sizing bug.
const AVATAR_IMAGE_SRC =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='32' fill='%230ea5e9'/%3E%3Crect y='32' width='64' height='32' fill='%234f46e5'/%3E%3C/svg%3E"

export const avatarSection: Section = {
  title: "Avatar",
  pairs: [
    {
      id: "avatar-image",
      ref: (
        <Avatar>
          <AvatarImage src={AVATAR_IMAGE_SRC} alt="Avatar" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      ),
      mui: <MuiAvatar src={AVATAR_IMAGE_SRC} alt="Avatar" />,
    },
    {
      id: "avatar-fallback",
      ref: (
        <Avatar>
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      ),
      mui: <MuiAvatar>CN</MuiAvatar>,
    },
  ],
}
