'use client';

import { Component } from 'react';
import Button from '../Button/Button';
import styles from './ErrorBoundary.module.css';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.errorContainer}>
          <div className={styles.icon}>⚠️</div>
          <h2 className={styles.title}>Something went wrong</h2>
          <p className={styles.message}>{this.state.error?.message || 'An unexpected error occurred'}</p>
          <Button onClick={this.handleReset} variant="primary">
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}