import { createTheme, Theme } from '@mui/material/styles'


const lightTheme: Theme = createTheme({
    palette: {
        mode: "light",
        text: {
            secondary: "#fff"
        }
    }
})

const darkTheme: Theme = createTheme({
    palette: {
        mode: "dark",
        background: {
            default: "#131516",
            paper: "#131516"
        },
        text: {
            primary: "#ff5733",
            secondary: "#fff",
            disabled: "#5f2805"

        },
        primary: {
            main: "#131516",
            light: "#212121",
            dark: "#000"
        }
    },
    components: {
        MuiSwitch: {
            styleOverrides: {
                track: ({ theme }) => ({
                    backgroundColor: theme.palette.text.disabled
                })
            }
        },
        MuiSlider: {
            styleOverrides: {
                thumb:{
                    color: "#5f2805",
                },
                track: {
                    color: "#ff5733"
                },
                rail: {
                    color: "#fff"
                }
            }
        }
    }
})

const themes: { [key: string]: Theme } = {
    light: lightTheme,
    dark: darkTheme
}

export default themes