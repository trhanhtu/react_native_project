# Periodic Table Explorer - Mobile Application

## Overview

This project is a mobile application designed to provide an interactive and comprehensive Periodic Table experience. It offers detailed information about chemical elements, along with features like podcast integration for learning, and user interaction.  This application is built using React Native for the frontend and Java Spring for the backend. 

## Features

* **User Authentication:**
    * Registration, login, and logout functionality. 
    * Password recovery via OTP. 
    * Profile management (update information, change email). 
* **Interactive Periodic Table:**
    * Display of the complete Periodic Table with detailed element information. 
    * Element search and filtering. 
* **Podcast Integration:**
    * Streaming of podcasts related to chemical elements. 
    * Podcast liking. 
    * Commenting on podcasts. 
* **User Interaction:**
    * Commenting on elements. 
    * Notifications for user activity. 
    * History of viewed elements. 

## Tech Stack

* **Frontend:**
    * React Native 
    * Expo 
    * Tailwind-RN 
    * UI-Kitten 
    * Axios 
    * sockjs 
    * stompjs 
* **Backend:**
    * Java 
    * Spring Boot 
    * Redis 
    * PostgreSQL 
    * WebSocket (Spring WebSocket) 
    * SMTP
* **Deployment:**
    * Azure 

## Project Structure

The project is structured into two main parts:

* **Frontend (React Native):** Handles the user interface and user interactions. It communicates with the backend API to fetch and display data.
* **Backend (Java Spring):** Provides the API endpoints, manages the database, and handles the application logic.

## API Endpoints

The backend exposes a RESTful API for the frontend to interact with. read more at [swagger-doc](https://periodic-table-b6dwgehjdvcteufk.southeastasia-01.azurewebsites.net/swagger-ui/index.html)

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

* **Figma Design:** [thegioituanhoan-figma](https://www.figma.com/design/rbCQw4g1Fb705oOnbCXZgT/Th%E1%BA%BF-gi%E1%BB%9Bi-tu%E1%BA%A7n-ho%C3%A0n?node-id=0-1&t=t2uHUzl2xtQzTJ7S-1)
* **Project Documentation:** [tailieukythuat.docx](def.com)

## Team

* Vương Đình Hiếu: Backend Spring Boot & DevOps 
* Trần Hoàng Anh Tú: UI Design & React Native 

## Acknowledgements

Special thanks to Thầy Nguyễn Hữu Trung for his guidance and support throughout the project.