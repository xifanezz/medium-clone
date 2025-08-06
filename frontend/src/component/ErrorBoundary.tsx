import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
    };

    // This lifecycle method is called when an error is thrown in a child component.
    // It allows us to update the state to render a fallback UI.
    public static getDerivedStateFromError(_: Error): State {
        return { hasError: true };
    }

    // This lifecycle method is called after an error has been thrown.
    // It's the perfect place to log the error to an external service.
    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // In a real application, you would log this to a service like Sentry, Logtail, etc.
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            // Render the fallback UI if an error has occurred.
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">Oops! Something went wrong.</h1>
                        <p className="text-gray-600 mb-4">We've been notified of the issue and are working to fix it.</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        // If there's no error, render the children as normal.
        return this.props.children;
    }
}

export default ErrorBoundary;
