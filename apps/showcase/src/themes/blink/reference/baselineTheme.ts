import { createTheme } from "@mui/material/styles";

export default createTheme({
    palette: {
        primary: {
            main: "#5A63B0",
        },
    },
    typography: {
        fontFamily: [
            // Quoted inside the string: a family name ending in a bare digit is not a valid
            // CSS identifier, so unquoted it invalidates the whole declaration (see the theme).
            '"Source Sans 3"',
            "ui-sans-serif",
            "system-ui",
            "-apple-system",
            "BlinkMacSystemFont",
            "Segoe UI",
            "Roboto",
            "Helvetica Neue",
            "Arial",
            "Noto Sans",
            "sans-serif",
            "Apple Color Emoji",
            "Segoe UI Emoji",
            "Segoe UI Symbol",
            "Noto Color Emoji",
        ].join(","),
        button: {
            textTransform: "none",
        },
    },
    components: {
        MuiSkeleton: {
            styleOverrides: {
                rounded: {
                    borderRadius: 6,
                },
            },
        },
    },
});
