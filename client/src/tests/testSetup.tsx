import React, { FC, ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { LocaleProvider } from "../base/Providers/Locales"
import { ThemeModeProvider } from "../base/Providers/ThemeMode"
import QueryClientProvider from "../base/Providers/QueryClient/Provider"
import NotistackProvider from "../base/Providers/Notistack/Provider"
import ErrorProvider from "../base/Providers/Errors/Provider"


jest.mock("react-router-dom", () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => jest.fn().mockImplementation((url: string) => window.history.replaceState({}, "", url)),
    useParams: () => jest.fn(() => ({
        uid: 1
    }))
}))

jest.setTimeout(30000)

const AllTheProviders: FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <ThemeModeProvider>
            <LocaleProvider>
                <ErrorProvider>
                    <NotistackProvider>
                        <QueryClientProvider>
                            {children}
                        </QueryClientProvider>
                    </NotistackProvider>
                </ErrorProvider>
            </LocaleProvider>
        </ThemeModeProvider>
    )
}

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllTheProviders, ...options })


export * from '@testing-library/react'
export { customRender as render }