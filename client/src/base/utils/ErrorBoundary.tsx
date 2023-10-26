import React from "react"
import ErrorPage from "../../app/pages/ErrorPage"


export default class ErrorBoundary extends React.Component<{ fallback?: any, children?: React.ReactNode }> {
    state = { hasError: false }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        console.log(error, errorInfo)
    }

    render () {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback

            return <ErrorPage />
        }

        return this.props.children
    }
}