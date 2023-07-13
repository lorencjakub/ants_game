import React, { FC, ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { LocaleProvider } from "../base/Providers/Locales"
import { ThemeModeProvider } from "../base/Providers/ThemeMode"
import QueryClientProvider from "../base/Providers/QueryClient/Provider"
import NotistackProvider from "../base/Providers/Notistack/Provider"
import ErrorProvider from "../base/Providers/Errors/Provider"
import { IntlProvider } from 'react-intl'
import { messagesGetter } from '../base/Providers/Locales/Provider'
import { enMessages } from "../app/config/locales"
import HomePage from '../app/pages/Home'
import { PlayerCardsProvider } from '../app/Providers'
import { io } from "./MockedSocketIO"
import { EventNames } from '../base/utils/SocketIO/eventNames'


const TEST_CONFIG = {
    DEFAULT_LANGUAGE: "en",
    DEFAULT_MESSAGES: enMessages,
    ACTIVE_LANGUAGES: "cs,en,de",
    DEFAULT_ROOM_GUID: "TestGuid",
    DEFAULT_PLAYER_TOKEN: "TestPlayer1Token",
    DEFAULT_ROOM_EVENTS: Object.values(EventNames).filter(n => n !== EventNames.CONNECT),
    TEST_TIMEOUT: 5000,
    ORIGINAL_ENV: process.env,
    SOURCES_INCREMENTS: [ "bricks", "weapons", "crystals" ]
}

jest.setTimeout(TEST_CONFIG.TEST_TIMEOUT)

jest.mock("react-router-dom", () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => jest.fn().mockImplementation((url: string) => window.history.replaceState({}, "", url)),
    useParams: () => ({ guid: TEST_CONFIG.DEFAULT_ROOM_GUID }),
    useRoutes: jest.fn(() => <HomePage />),
    useLocation: jest.fn(() => window.location)
}))

jest.mock('axios', () => {
    return {
        create: () => {
            return {
                get: jest.fn().mockImplementation((...params: any) => Promise.resolve({ data: [...params] })),
                put: jest.fn().mockImplementation((...params: any) => Promise.resolve({ data: [...params] })),
                post: jest.fn().mockImplementation((...params: any) => Promise.resolve({ data: [...params] })),
                delete: jest.fn().mockImplementation((...params: any) => Promise.resolve({ data: [...params] }))
            }
        }
    }
})

jest.mock('socket.io-client', () => ({
    ...jest.requireActual("socket.io-client"),
    io: io
}))

const testMessagesGetter = (locale?: string): { [key: string]: string } => {
    return locale ? messagesGetter(locale) : TEST_CONFIG.DEFAULT_MESSAGES
}

const AllTheProviders: FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <ThemeModeProvider>
            <LocaleProvider defaultLocale={TEST_CONFIG.DEFAULT_LANGUAGE}>
                <IntlProvider locale={TEST_CONFIG.DEFAULT_LANGUAGE}>
                    <ErrorProvider>
                        <NotistackProvider>
                            <QueryClientProvider>
                                <PlayerCardsProvider>
                                    {children}
                                </PlayerCardsProvider>
                            </QueryClientProvider>
                        </NotistackProvider>
                    </ErrorProvider>
                </IntlProvider>
            </LocaleProvider>
        </ThemeModeProvider>
    )
}

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllTheProviders, ...options })


export * from '@testing-library/react'
export {
    customRender as render,
    TEST_CONFIG,
    testMessagesGetter
}