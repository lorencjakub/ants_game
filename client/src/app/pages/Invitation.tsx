import { FC, useEffect } from 'react'
import { useIntl } from "react-intl"
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import ApiClient from '../../base/utils/Axios/ApiClient'
import { IRoomInfoResponse } from '../../base/utils/Axios/types'
import { AxiosError } from 'axios'
import Loading from '../../base/components/Loading'


const Invitation: FC<{}> = () => {
    const { guid } = useParams()
    const navigate = useNavigate()
    const intl = useIntl()

    const {
        refetch: verifyInvitation
    } = useQuery<IRoomInfoResponse, AxiosError>(
        ["join_room_query"],
        async () => await ApiClient.joinRoom(guid),
        {
            enabled: false,
            onSuccess: (res) => {
                sessionStorage.setItem("Token", res.token)
                navigate(`/room/${guid}`)
            }
        }
    )

    useEffect(() => {
        sessionStorage.setItem("Token", "")
        verifyInvitation()
    }, [])

    return (
        <Loading
            message={intl.formatMessage({ id: "processing_backdrop_message.connecting", defaultMessage: "Connecting to the game..." })}
            sx={{
                backgroundColor: "background.default",
                opacity: 0,
                zIndex: 5
            }}
        />
    )
}

export default Invitation
