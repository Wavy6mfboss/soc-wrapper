/* ───────────────────────── renderer/ErrorBoundary.tsx
   Generic React error boundary with default export
────────────────────────────────────────────────────────── */
import React from 'react'

interface State {
  error: Error | null
}

class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  constructor (props: React.PropsWithChildren) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError (error: Error) {
    return { error }
  }

  componentDidCatch (error: Error, info: React.ErrorInfo) {
    /* eslint-disable no-console */
    console.error('[Renderer Error]', error, info)
    /* eslint-enable  no-console */
  }

  render () {
    if (this.state.error) {
      return (
        <div style={{ padding: 32, fontFamily: 'sans-serif', color: '#c00' }}>
          <h1>Something went wrong.</h1>
          <pre>{this.state.error.message}</pre>
          <button onClick={() => location.reload()}>Reload</button>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
