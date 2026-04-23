# HabitFlow (IS4447 - Option A) 122435894

## GitHub Repository URL
https://github.com/MartinOS03/IS4447-habit-tracker

## Expo Link
https://expo.dev/accounts/martinosullivans-organization/projects/IS4447-habit-tracker/updates/2251b04c-f7cb-42b7-b0f5-a664b6756d32

## App Description
HabitFlow is a React Native mobile app that helps users create habits, log daily completion, organise habits by category, set weekly/monthly targets and view visual progress insights.

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
