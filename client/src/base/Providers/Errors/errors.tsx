import { FormattedMessage } from "react-intl"


const errorList: { [key: string] : JSX.Element } = {
    "network_error": <FormattedMessage id="api_errors.network_error" defaultMessage="Network Error" />
}

export { errorList }