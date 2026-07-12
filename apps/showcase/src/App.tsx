import MuiButton from "@mui/material/Button"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "./ModeToggle"

export default function App() {
  return (
    <div className="flex min-h-svh items-center justify-center gap-4">
      <ModeToggle />
      <Button>shadcn</Button>
      <MuiButton variant="contained">MUI</MuiButton>
    </div>
  )
}
