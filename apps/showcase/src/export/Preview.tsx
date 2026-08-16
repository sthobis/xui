import Alert from "@mui/material/Alert"
import Button from "@mui/material/Button"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import CardHeader from "@mui/material/CardHeader"
import Checkbox from "@mui/material/Checkbox"
import Chip from "@mui/material/Chip"
import FormControlLabel from "@mui/material/FormControlLabel"
import MenuItem from "@mui/material/MenuItem"
import Slider from "@mui/material/Slider"
import Stack from "@mui/material/Stack"
import Switch from "@mui/material/Switch"
import Tab from "@mui/material/Tab"
import Tabs from "@mui/material/Tabs"
import TextField from "@mui/material/TextField"
import { useState } from "react"

/**
 * The components the export preview renders - a small, fixed kitchen sink, idiomatic MUI with no
 * theme-specific props, so the SAME markup previews all three themes. Primary-coloured surfaces
 * lead (buttons, checkbox, switch, slider, tabs) because primary is the loudest knob; the text
 * field and card carry the radius and the font where they are easiest to see.
 */
export function Preview() {
  const [tab, setTab] = useState(0)
  const [slider, setSlider] = useState(40)
  return (
    <Stack spacing={3} sx={{ maxWidth: 560 }}>
      <Stack direction="row" spacing={1.5} sx={{ flexWrap: "wrap" }}>
        <Button variant="contained">Primary</Button>
        <Button variant="outlined">Outlined</Button>
        <Button variant="text">Ghost</Button>
        <Button variant="contained" color="error">
          Destructive
        </Button>
      </Stack>
      <Tabs value={tab} onChange={(_, v: number) => setTab(v)}>
        <Tab label="Overview" />
        <Tab label="Analytics" />
        <Tab label="Reports" />
      </Tabs>
      <Card variant="outlined">
        <CardHeader title="Payout threshold" subheader="Minimum balance before a payout triggers" />
        <CardContent>
          <Stack spacing={2.5}>
            <TextField label="Amount" defaultValue="2500.00" size="small" fullWidth />
            <TextField label="Currency" select defaultValue="usd" size="small" fullWidth>
              <MenuItem value="usd">USD - United States Dollar</MenuItem>
              <MenuItem value="eur">EUR - Euro</MenuItem>
              <MenuItem value="jpy">JPY - Japanese Yen</MenuItem>
            </TextField>
            <Slider value={slider} onChange={(_, v) => setSlider(v as number)} />
            <Stack direction="row" spacing={2} sx={{ alignItems: "center", flexWrap: "wrap" }}>
              <FormControlLabel control={<Checkbox defaultChecked />} label="Auto-save" />
              <FormControlLabel control={<Switch defaultChecked />} label="Recurring" />
              <Chip label="Weekly" size="small" />
              <Chip label="Active" color="primary" size="small" />
            </Stack>
          </Stack>
        </CardContent>
      </Card>
      <Alert severity="success">Your changes preview live - this is the exported theme itself.</Alert>
    </Stack>
  )
}
