import React, { FC, ReactNode } from "react"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useSnackbar } from "notistack"
import { useErrors } from "../Errors"


const Provider: FC<{ children: ReactNode }> = ({ children }) => {
  const { enqueueSnackbar } = useSnackbar()
  const { parseErrorMessage } = useErrors()

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Infinity,
        onError: (err: any) => {
          console.log(err)
          var errorData = ""

          if (!err?.response && err?.message) {
            errorData = err?.message
          } else if (err?.response?.data && err?.response?.data.message) {
            errorData = err?.response?.data.message
          }

          enqueueSnackbar(
            parseErrorMessage && parseErrorMessage(errorData),
            {
              variant: "error"
            }
          )
        }
      },
      mutations: {
        onError: (err: any) => {
          console.log(err)
          enqueueSnackbar(
            parseErrorMessage && parseErrorMessage(err?.response?.data),
            {
              variant: "error"
            }
          )
        }
      }
    },
  })
  
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

export default Provider