import React, { FC, useEffect } from "react"
import {
    FormControlLabel,
    TextField,
    Checkbox,
    Paper,
    Box,
    Grid,
    Typography,
    Slider,
    Tooltip,
    SliderValueLabelProps
} from "@mui/material"
import { useFormData } from "../Providers/FormData"
import {
    TFormField,
    IFormData,
    IFormFields
} from "../../base/utils/types"
import CustomMultiSelect from "../../base/components/CustomMultiSelect"
import { useTheme as useMuiTheme } from "@mui/material/styles"


const Form: FC<{ fields: IFormFields}> = ({ fields = {} }) => {
    const { formData = {}, setFormData } = useFormData()
    const theme = useMuiTheme()

    useEffect(() => {
        var initialValues: IFormData = {}

        Object.entries(fields).forEach(([fieldName, fieldData]) => { initialValues[fieldName] = fieldData.defaultvalue })
        if (setFormData) setFormData(initialValues)
    }, [])

    const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (setFormData) setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSliderChange = (inputName: string, value: number) => {
        if (setFormData) setFormData({ ...formData, [inputName]: value})
    }

    const handleBindedSliderChange = (inputName: string, value: number) => {
        var newData = { ...formData }
        var sumOfOtherSliders = 0
        var slidersNames = Object.keys(newData).filter((name) => {
            if (fields[name].type == "binded_slider" && (name != inputName)) {
                sumOfOtherSliders += Number(newData[name]) || 0
                return name
            }
        })
        const onePiece = ((100 - value) == 0) ? 0 : (100 - value) / sumOfOtherSliders

        slidersNames.forEach((name) => {
            if (newData[name]) {
                newData[name] = Math.round(onePiece * Number(newData[name]))
            }
        })

        if (setFormData) setFormData({ ...newData, [inputName]: value})
    }

    const handleChangeCheckboxField = (inputName: string, checked: boolean) => {
        if (setFormData) setFormData({ ...formData, [inputName]: checked })
    }

    return (
        <Paper
            elevation={1}
            data-testid="pages.form"
        >
            <Grid
                container
                direction="column"
                sx={{
                    p: 2
                }}
            >
                {Object.entries(fields).map(([fieldName, fieldData]: [string, TFormField]) => {
                    if (fieldData.type == "checkbox") {
                        return (
                            <Grid
                                item
                                key={fieldName}
                                xs={12}
                                sx={{
                                    my: 1
                                }}
                            >
                                <FormControlLabel
                                    key={`${fieldName}_checkbox_label`}
                                    label={fieldData.label}
                                    control={
                                        <Checkbox
                                            data-testid={`${fieldName}_checkbox`}
                                            key={`${fieldName}_checkbox_input`}
                                            checked={(formData[fieldName] == undefined) ? Boolean(fieldData.defaultvalue) : Boolean(formData[fieldName])}
                                            onChange={(e, checked) => handleChangeCheckboxField(fieldName, checked)}
                                            required={fieldData.required}
                                            disabled={fieldData.disabled}
                                            style={{
                                                color: theme.palette.text.primary,
                                                borderColor: theme.palette.text.primary
                                            }}
                                        />
                                    }
                                />
                            </Grid>
                        )
                    } else if (fieldData.type && fieldData.type.includes("slider")) {
                        return (
                            <Box
                                key={`${fieldName}_slider.box`}
                                sx={{
                                    width: 250,
                                    my: 1
                                }}
                            >
                                <Typography id="input-slider" gutterBottom color="text.secondary">
                                    {fieldData.label}
                                </Typography>
                                <Grid
                                    container
                                    spacing={2}
                                    alignItems="center"
                                    key={`${fieldName}_slider.outer_grid`}
                                >
                                    <Grid
                                        item
                                        xs
                                        key={`${fieldName}_slider.inner_grid`}
                                    >
                                        <Slider
                                            data-testid={`${fieldName}_slider`}
                                            key={`${fieldName}_slider.component`}
                                            value={(Number(formData[fieldName]) === 0) ? 0 : Number(formData[fieldName]) || Number(fieldData.defaultvalue)}
                                            onChange={(event: Event, value: number | number[], activeThumb: number) => {
                                                (fieldData.type == "binded_slider") ?
                                                handleBindedSliderChange(fieldName, Array.isArray(value) ? value[0] : value)
                                                :
                                                handleSliderChange(fieldName, Array.isArray(value) ? value[0] : value)
                                            }}
                                            aria-labelledby="input-slider"
                                            valueLabelDisplay="auto"
                                            aria-label="custom thumb label"
                                            defaultValue={Number(fieldData.defaultvalue)}
                                            min={Number(fieldData.min) || 0}
                                            max={Number(fieldData.max) || 100}
                                        />
                                    </Grid>
                                </Grid>
                            </Box>
                        )
                    } else if (fieldData.type == "multiselect") {
                        return <CustomMultiSelect inputName={fieldName} inputProps={fieldData} key={`${fieldName}_multiselect`} />
                    } else {
                        return (
                            <Grid
                                key={`${fieldName}_textfield.grid`}
                                item
                                xs={12}
                                sx={{
                                    my: 1
                                }}
                            >
                                <TextField
                                    data-testid={`${fieldName}_text_field`}
                                    key={`${fieldName}_textfield.input`}
                                    label={fieldData.label}
                                    name={fieldName}
                                    value={formData[fieldName] || fieldData.defaultvalue}
                                    type={fieldData.type || "text"}
                                    onChange={handleChangeInput}
                                    required={fieldData.required}
                                    InputProps={{
                                        disabled: fieldData.disabled
                                    }}
                                />
                            </Grid>
                        )
                    }
                })}
            </Grid>
        </Paper>
    )
}

export default Form