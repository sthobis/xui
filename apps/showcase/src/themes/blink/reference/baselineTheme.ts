import { createTheme } from "@mui/material/styles";

export default createTheme({
    palette: {
        primary: {
            main: "#5A63B0",
        },
    },
    typography: {
        fontFamily: [
            "Source Sans Pro",
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
