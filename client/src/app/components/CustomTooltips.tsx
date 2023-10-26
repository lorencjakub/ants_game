import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip'
import { styled } from '@mui/material/styles'


const StyledBonusTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: theme.palette.success.main,
        color: theme.palette.common.white,
        boxShadow: theme.shadows[1],
        fontSize: 11
    },
    [`& .${tooltipClasses.arrow}`]: {
        color: theme.palette.success.main
    }
}))

const StyledLossTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: theme.palette.error.main,
        color: theme.palette.common.white,
        boxShadow: theme.shadows[1],
        fontSize: 11
    },
    [`& .${tooltipClasses.arrow}`]: {
        color: theme.palette.error.main
    }
}))

export {
    StyledBonusTooltip,
    StyledLossTooltip
}