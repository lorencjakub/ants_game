import { FormattedMessage } from "react-intl"


const errorList: { [key: string] : JSX.Element } = {
    "network_error": <FormattedMessage id="server_errors.network_error" defaultMessage="Network Error" />,
    "RM_NAC": <FormattedMessage id="server_errors.RM_NAC" defaultMessage="Room is not active anymore" />,
    "RM_INV": <FormattedMessage id="server_errors.RM_INV" defaultMessage="Invalid room" />,
    "RM_FLL": <FormattedMessage id="server_errors.RM_FLL" defaultMessage="This room is already full" />,
    "CRD_MSN": <FormattedMessage id="server_errors.CRD_MSN" defaultMessage="Card error" />,
    "CRD_PLR": <FormattedMessage id="server_errors.CRD_PLR" defaultMessage="Card error" />,
    "CRD_XPS": <FormattedMessage id="server_errors.CRD_XPS" defaultMessage="This card is too expensive for the player" />,
    "CRD_NTF": <FormattedMessage id="server_errors.CRD_NTF" defaultMessage="Card error" />,
    "TRN_PLR": <FormattedMessage id="server_errors.TRN_PLR" defaultMessage="Player is not on turn now" />,
    "TRN_SWC": <FormattedMessage id="server_errors.TRN_SWC" defaultMessage="Error during switching turn" />,
    "PLR_WTN": <FormattedMessage id="server_errors.PLR_WTN" defaultMessage="You cannot play until second player join the room" />,
    "PLR_SRC": <FormattedMessage id="server_errors.PLR_SRC" defaultMessage="Sources data error" />,
    "PLR_DCT": <FormattedMessage id="server_errors.PLR_DCT" defaultMessage="Only host player is able to deactivate room" />,
    "PLR_NTF": <FormattedMessage id="server_errors.PLR_NTF" defaultMessage="Player not found in room" />,
    "PLR_RM": <FormattedMessage id="server_errors.PLR_RM" defaultMessage="Player is already in this room" />,
    "SRC_NTF": <FormattedMessage id="server_errors.SRC_NTF" defaultMessage="Sources data error" />,
}

export { errorList }