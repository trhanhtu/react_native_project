# Periodic Table Explorer - Mobile Application

## Overview

This project is a mobile application designed to provide an interactive and comprehensive Periodic Table experience. It offers detailed information about chemical elements, along with features like podcast integration for learning, and user interaction.  This application is built using React Native for the frontend and Java Spring for the backend. [cite: 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37]

## Features

* **User Authentication:**
    * Registration, login, and logout functionality. [cite: 38, 39, 40, 41]
    * Password recovery via OTP. [cite: 12, 13, 14]
    * Profile management (update information, change email). [cite: 6, 7, 8, 9, 10, 11]
* **Interactive Periodic Table:**
    * Display of the complete Periodic Table with detailed element information. [cite: 6, 7, 8, 9, 10, 11]
    * Element search and filtering. [cite: 9, 10, 11]
* **Podcast Integration:**
    * Streaming of podcasts related to chemical elements. [cite: 9, 10, 11]
    * Podcast liking. [cite: 163, 164, 165, 166, 167, 168, 169, 170, 171]
    * Commenting on podcasts. [cite: 136, 137, 138, 139, 140, 141, 142, 143, 144]
* **User Interaction:**
    * Commenting on elements. [cite: 118, 119, 120, 121, 122, 123, 124, 125, 126]
    * Notifications for user activity. [cite: 145, 146, 147, 148, 149, 150, 151, 152, 153]
    * History of viewed elements. [cite: 154, 155, 156, 157, 158, 159, 160, 161, 162]

## Tech Stack

* **Frontend:**
    * React Native [cite: 38, 39, 40, 41]
    * Expo [cite: 38, 39, 40, 41]
    * Tailwind-RN [cite: 38, 39, 40, 41]
    * UI-Kitten [cite: 38, 39, 40, 41]
    * Axios [cite: 38, 39, 40, 41]
    * sockjs [cite: 38, 39, 40, 41]
    * stompjs [cite: 38, 39, 40, 41]
* **Backend:**
    * Java [cite: 38, 39, 40, 41]
    * Spring Boot [cite: 38, 39, 40, 41]
    * Redis [cite: 38, 39, 40, 41]
    * PostgreSQL [cite: 38, 39, 40, 41]
    * WebSocket (Spring WebSocket) [cite: 38, 39, 40, 41]
    * SMTP
* **Deployment:**
    * Azure [cite: 38, 39, 40, 41]

## Project Structure

The project is structured into two main parts:

* **Frontend (React Native):** Handles the user interface and user interactions. It communicates with the backend API to fetch and display data.
* **Backend (Java Spring):** Provides the API endpoints, manages the database, and handles the application logic.

## API Endpoints

The backend exposes a RESTful API for the frontend to interact with. Key endpoints include:

* `/api/v1/auth`:  For user authentication (login, register, reset password). [cite: 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72]
* `/api/v1/users`:  For managing user profiles. [cite: 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100]
* `/api/v1/elements`:  For retrieving and searching elements. [cite: 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126]
* `/api/v1/podcasts`:  For retrieving podcast information. [cite: 129, 130, 131, 132, 133, 134, 135]
* `/api/v1/comments`:  For managing comments on podcasts. [cite: 138, 139, 140, 141, 142, 143, 144]
* `/api/v1/notifications`:  For retrieving user notifications. [cite: 147, 148, 149, 150, 151, 152, 153]
* `/api/v1/viewed-elements`: For viewing element history. [cite: 156, 157, 158, 159, 160, 161, 162]
* `/api/v1/favorite-podcasts`: For managing favorite podcasts. [cite: 165, 166, 167, 168, 169, 170, 171]

## Setup Instructions

### Prerequisites

* Node.js and npm (for React Native)
* Java JDK (for Spring Boot)
* PostgreSQL
* Redis

### Installation

1.  **Backend:**
    * Clone the backend repository.
    * Set up the PostgreSQL and Redis databases.
    * Configure the database connection in the Spring Boot application properties.
    * Build and run the Spring Boot application.
2.  **Frontend:**
    * Clone the frontend repository.
    * Install dependencies using `npm install` or `yarn install`.
    * Configure the API URL to point to your running backend.
    * Run the React Native application using `expo start` or `react-native run-android` / `react-native run-ios`.

## Additional Information

* **Figma Design:** [abc.com](abc.com)
* **Project Documentation:** [def.com](def.com)

## Team

* Vương Đình Hiếu: Backend Spring Boot & DevOps [cite: 45]
* Trần Hoàng Anh Tú: UI Design & React Native [cite: 45]

## Acknowledgements

Special thanks to Thầy Nguyễn Đức Trung for his guidance and support throughout the project. [cite: 4, 5, 6, 7]