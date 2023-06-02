import React, { FC, useEffect, useState } from "react"
import {
    Checkbox,
    InputLabel,
    ListItemIcon,
    ListItemText,
    MenuItem,
    FormControl,
    Select,
    Box,
    Chip,
    ListSubheader
} from "@mui/material"
import { Cancel as CancelIcon } from "@mui/icons-material"
import { useFormData } from "../../app/Providers/FormData"
import { TFormField } from "../utils/types"
import { useIntl } from "react-intl"


type TMultiSelectOptions = { [value: string]: string }

interface IMultiSelectProps {
    inputName: string,
    inputProps: TFormField,
    itemHeight?: number,
    itemPaddingTop?: number
}

const CustomMultiSelect: FC<IMultiSelectProps> = (props) => {
    const { inputName, inputProps, itemHeight = 48, itemPaddingTop = 8 } = props

    const selectValues = inputProps.selectvalues as TMultiSelectOptions | { [subheaderLabel: string]: TMultiSelectOptions }
    const withSubheaders = Object.values(selectValues)[0].constructor === Object

    const { formData = {}, setFormData } = useFormData()
    const [ options, setOptions ] = useState<TMultiSelectOptions>({})
    const isAllSelected = Object.keys(options).length > 0 && (formData[inputName] as string[] || []).length === Object.keys(options).length
    const intl = useIntl()

    const MenuProps = {
        PaperProps: {
            style: {
                maxHeight: itemHeight * 4.5 + itemPaddingTop,
                width: 250
            }
        },
        getContentAnchorEl: null,
        anchorOrigin: {
            vertical: "bottom",
            horizontal: "center"
        },
        transformOrigin: {
            vertical: "top",
            horizontal: "center"
        },
        variant: "menu"
    }

    useEffect(() => {
        if (withSubheaders) {
            var newOptions = {}

            Object.values(selectValues).map((choices) => {
                newOptions = { ...newOptions, ...choices }
            })
        } else {
            newOptions = selectValues
        }

        setOptions(newOptions)
    }, [])

    const handleChange = (event: any) => {
        if (!setFormData) return

        const value = event.target.value
        console.log(value)
        if (value[value.length - 1] === "all") {
            setFormData({ ...formData, [inputName]: ((formData[inputName] as string[] || []).length === Object.keys(options).length) ? [] : Object.keys(options) })
            return
        }

        setFormData({ ...formData, [inputName]: value })
    }

    const handleDeleteOption = (value: string) => {
        var newSelectOptions = (formData[inputName] as string[] || []).filter((s) => s != value)
        if (setFormData) setFormData({ ...formData, [inputName]: newSelectOptions })
    }

    return (
        <FormControl
            key={`${inputName}_multiselect.formcontrol`}
            sx={{ my: 1 }}
            data-testid={`${inputName}_multiselect`}
        >
            <InputLabel
                shrink={((formData[inputName] as string[] || []).length !== 0)}
                key={`${inputName}_multiselect.label`}
                id={`${inputName}_multiselect.label`}
            >
                {inputProps.label}
            </InputLabel>
            <Select
                notched={((formData[inputName] as string[] || []).length !== 0)}
                variant="outlined"
                label={inputProps.label}
                labelId={`${inputName}_multiselect.label`}
                key={`${inputName}_multiselect.input`}
                name={inputName}
                multiple
                value={(formData[inputName] as string[] || [])}
                onChange={handleChange}
                renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.slice(0, 4).map((value) => {
                            return (
                            <Chip
                                key={`${inputName}_multiselect.options.${value}`}
                                label={options[String(value) as keyof typeof options]}
                                clickable
                                deleteIcon={
                                    <CancelIcon
                                        onMouseDown={(event) => event.stopPropagation()}
                                    />
                                }
                                onDelete={() => handleDeleteOption(value)}
                                sx={{
                                    maxWidth: 150
                                }}
                            />
                        )})}
                        {(selected.length > 4) ?
                            <Chip
                                key={`${inputName}_multiselect.options.more`}
                                label={`+ ${selected.length - 4}`}
                            />
                            : null
                        }
                    </Box>
                )}
                MenuProps={MenuProps as any}
                displayEmpty={true}
                sx={{
                    maxWidth: 350
                }}
            >
                <MenuItem value="all">
                    <ListItemIcon>
                        <Checkbox
                            checked={isAllSelected}
                            indeterminate={(formData[inputName] as string[] || []).length > 0 && (formData[inputName] as string[] || []).length < Object.keys(options).length}
                        />
                    </ListItemIcon>
                    <ListItemText primary={intl.formatMessage({ id: "multiselect.options.select_all", defaultMessage: "Select All" })} />
                </MenuItem>
                {(withSubheaders) ? 
                    Object.entries(selectValues).map(([subheaderLabel, choices]: [string, TMultiSelectOptions]) => {
                        var subsection = [ <ListSubheader>{subheaderLabel}</ListSubheader> ]
                        
                        Object.entries(choices).map(([value, label]: [string, string]) => {
                            subsection.push(
                                <MenuItem key={value} value={value}>
                                    <ListItemIcon>
                                        <Checkbox checked={(formData[inputName] as string[] || []).indexOf(value) > -1} />
                                    </ListItemIcon>
                                    <ListItemText primary={label} />
                                </MenuItem>
                            )
                        })

                        return subsection
                    })
                    :
                    Object.entries(selectValues).map(([value, label]: [string, string]) => (
                        <MenuItem key={value} value={value}>
                            <ListItemIcon>
                                <Checkbox checked={(formData[inputName] as string[] || []).indexOf(value) > -1} />
                            </ListItemIcon>
                            <ListItemText primary={label} />
                        </MenuItem>
                    ))
                }
            </Select>
        </FormControl>
    )
}

export default CustomMultiSelect