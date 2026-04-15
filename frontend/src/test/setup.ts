import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// Mock Pusher class
class PusherMock {
  subscribe() {
    return { bind: () => {} }
  }
  unsubscribe() {}
  disconnect() {}
}

// Mock Echo class
class EchoMock {
  private() {
    return { listen: () => {} }
  }
  channel() {
    return { listen: () => {} }
  }
  leaveChannel() {}
  leave() {}
  disconnect() {}
}

vi.mock('pusher-js', () => ({
  default: PusherMock,
}))

vi.mock('laravel-echo', () => ({
  default: EchoMock,
}))

// Ensure window properties are set for libraries that expect them globally
global.window.Pusher = PusherMock as any
global.window.Echo = new EchoMock() as any
