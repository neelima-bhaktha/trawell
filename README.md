# Trawell

Trawell is a complete fleet management and driver operations mobile application designed for car rental businesses. It features an automated onboarding process and structured vehicle inspection logs to digitize driver workflows entirely. The centralized admin control center gives business owners end to end monitoring of trips and records.

## Project Architecture

The application is built using a modern decoupled mobile architecture to ensure scalability and ease of deployment.

* Frontend Framework: React Native with Expo using Expo Router for file based navigation
* Styling Engine: Tailwind CSS implemented via NativeWind
* Backend Services: Firebase Authentication, Firestore Database, and Cloud Storage

## Core User Roles

### 1. Admin Business Owner
The administrative dashboard provides complete centralized control over operations. Responsibilities include managing driver accounts, verifying registration documents, tracking vehicle inventory, creating or assigning trips, and inspecting completed operational logs.

### 2. Driver
The driver interface streamlines daily workflows. Responsibilities include submitting onboarding documentation, performing mandatory pre trip and post trip vehicle image inspections, and reporting real time trip milestones such as kilometer readings and fuel details.

## Database Schema Design

The data layer is structured in Firestore under four primary collections to ensure data integrity and efficient queries.

* users: Stores core authentication profiles specifying names, contact details, and system roles.
* drivers: Manages onboarding verification statuses and links to secure document storage paths.
* vehicles: Maintains real time fleet inventory, current odometer readings, and availability statuses.
* trips: Tracks the entire lifecycle of a delivery or ride log including specific vehicle assignments and multi angle inspection image lists.

## Getting Started

### Prerequisites
Ensure that Node.js and the Git command line utility are installed on your local environment.

### Local Installation
1. Clone the repository to your machine.
2. Run npm install to pull down the required project dependencies.
3. Add your web configuration variables from the Firebase Console into the designated configuration path.
4. Execute the local development command using the Expo CLI to start testing on a physical mobile device or simulator.
