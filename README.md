# HabitFlow (IS4447 Project - Option A)

## GitHub Repository URL
Add your public repository URL here before submission.

## Expo Link / QR
Add your public Expo link here before submission.

## App Description
HabitFlow is a React Native mobile app that helps users create habits, log daily completion, organize habits by category, set weekly/monthly targets, and view visual progress insights.

## Tech Stack
- React Native (Expo + TypeScript)
- SQLite (`expo-sqlite`)
- Drizzle ORM
- React Navigation
- Jest + React Native Testing Library

## Setup Instructions
1. Install dependencies:
   - `npm install`
2. Start the app:
   - `npx expo start`
3. Run tests:
   - `npm test`

## Authentication
- Register with email + password.
- Login/logout is local-only.
- Profile delete is available in Settings.

## Notes
- Data persists locally on device via SQLite.
- Seed data runs automatically at app startup (only when DB is empty).
