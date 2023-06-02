import React, { FC } from "react"
import {
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from "@mui/material"
import { INutrients } from '../../base/utils/Axios/types'
import { useIntl } from "react-intl"


const RowGetter: FC<{
    rowName: string,
    rowData: { [key: string] : string },
    tableName: string
    header?: boolean
}> = ({ rowName, rowData, tableName, header = false }) => {
    const intl = useIntl()
    const rowNames: { [key: string] : string } = {
        "carbs": intl.formatMessage({ id: "pages.daily_menu.nutrients_table.carbs", defaultMessage: "Carbs" }),
        "proteins": intl.formatMessage({ id: "pages.daily_menu.nutrients_table.proteins", defaultMessage: "Proteins" }),
        "fats": intl.formatMessage({ id: "pages.daily_menu.nutrients_table.fats", defaultMessage: "Fats" }),
        "fiber": intl.formatMessage({ id: "pages.daily_menu.nutrients_table.fiber", defaultMessage: "Fiber" }),
        "energy": intl.formatMessage({ id: "pages.daily_menu.nutrients_table.energy", defaultMessage: "Energy" }),
        "nutrient": intl.formatMessage({ id: "pages.daily_menu.nutrients_table.nutrient_column", defaultMessage: "Nutrient" })
    }

    return (
        <TableRow
            data-testid={`containers.layout.content.${tableName}.nutrients_table.${(header) ? "header" : rowName}`}
            sx={(header) ? undefined : { '&:last-child td, &:last-child th': { border: 0 } }}
        >
            <TableCell
                component="th"
                scope="row"
            >
                <Typography
                    variant="body1"
                    color={(header) ? "text.primary" : "text.secondary"}
                    noWrap
                >
                    {rowNames[rowName]}
                </Typography>
            </TableCell>
            <TableCell
                align="right"
            >
                <Typography
                    variant="body1"
                    color={(header) ? "text.primary" : "text.secondary"}
                    noWrap
                >
                    {rowData.amount}
                </Typography>
            </TableCell>
            <TableCell
                align="right"
            >
                <Typography
                    variant="body1"
                    color={(header) ? "text.primary" : "text.secondary"}
                    noWrap
                >
                    {`${rowData.ratio} %`}
                </Typography>
            </TableCell>
        </TableRow>
    )
}

const NutrientsTable: FC<{ nutrients: INutrients, tableName: string }> = ({ nutrients, tableName }) => {
    const intl = useIntl()
    const headers: { [key: string] : { [key: string] : string } } = {
        "nutrient": {
            "amount": intl.formatMessage({ id: "pages.daily_menu.nutrients_table.amount_column", defaultMessage: "Amount" }),
            "ratio": intl.formatMessage({ id: "pages.daily_menu.nutrients_table.ratio_column", defaultMessage: "Ratio" })        
        }
    }
    
    return (
        <TableContainer
            component={Paper}
            elevation={1}
            data-testid={`containers.layout.content.${tableName}.nutrients_table`}
            style={{
                display: 'flex',
                overflow: 'hidden'
            }}
            sx={{
                px: 5,
                py: 2,
                m: 1,
                width: "95%",
                backgroundColor: "primary.dark",
                borderRadius: 5
            }}
        >
            <Table aria-label="simple table">
                <TableHead>
                    {Object.entries(headers).map(
                        ([rowName, rowData]: [string, { [key: string] : string }]) => {
                            return (
                                <RowGetter
                                    rowName={rowName}
                                    rowData={rowData}
                                    tableName={tableName}
                                    header={true}
                                    key={`${rowName}_row`}
                                />
                            )
                        }
                    )}
                </TableHead>
                <TableBody>
                    {Object.entries(nutrients).map(
                        ([rowName, rowData]: [string, { [key: string] : string }]) => {
                            return (
                                <RowGetter
                                    rowName={rowName}
                                    rowData={rowData}
                                    tableName={tableName}
                                    key={`${rowName}_row`}
                                />
                            )
                        }
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    )
}

export default NutrientsTable