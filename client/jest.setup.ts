import "@testing-library/jest-dom"
import { TEST_CONFIG } from "./src/tests/testSetup"


beforeEach(() => {
    jest.resetModules()
    process.env = {
        ...TEST_CONFIG.ORIGINAL_ENV,
        DEFAULT_LANGUAGE: TEST_CONFIG.DEFAULT_LANGUAGE,
        ACTIVE_LANGUAGES: TEST_CONFIG.ACTIVE_LANGUAGES
    }
    jest.clearAllMocks()
    document.body.innerHTML = ""
    localStorage.clear()
    sessionStorage.clear()
})

afterEach(() => {
    process.env = { ...TEST_CONFIG.ORIGINAL_ENV }
})