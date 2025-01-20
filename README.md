# Project: Golden Raspberry Awards API

## Description

This is a RESTful API developed in **Node.js** using the **NestJS** framework. The primary goal of the API is to provide information about the nominees and winners of the "Worst Picture" category of the Golden Raspberry Awards.

The API identifies the producers with the largest and smallest gaps between consecutive wins, based on the data provided in a CSV file, located in: /data in the project's root folder. After adding the CSV file, remember to specify the file name in the CSV_FILE environment variable.

---

## System Requirements

- **Node.js** version 16 or higher.
- **NestJS** version 9 or higher.
- In-memory database using **SQLite**.

---

## Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure environment variables in the `.env` file (example):

   ```env
   CSV_FILE=movielist.csv
   ```

3. Start the application:

   ```bash
   npm run start
   ```

The application will be available at `http://localhost:3000`.
Swagger will be available at `http://localhost:3000/api/docs`.

---

## Running Tests

The project has integration tests.

1. Run the tests:

   ```bash
   npm run test:e2e
   ```

2. Check the results in the terminal.

---

## Project Structure

The project follows a Hexagonal Architecture approach.

```
src/
├── modules/                 # Application modules, organized by context
│   ├── movie/               # Main context related to movies and producers
│   │   ├── contexts/        # Subdivisions of the module, separated by responsibilities
│   │   │   ├── awards/       # Business logic related to awards
│   │   │   │   ├── awards.service.ts       # Service with business rules
│   │   │   │   ├── awards.interface.ts     # Contract for awards services
│   │   │   │   ├── awards.dto.ts           # Data Transfer Objects used in endpoints
│   │   │   ├── data-loading/               # Data loading
│   │   │       ├── csv-data-loader.service.ts  # Service for reading CSV
│   │   │       ├── data-loader.interface.ts    # Contract for data loaders
│   │   ├── movie.controller.ts           # Controller to manage movie endpoints
│   │   ├── movie.module.ts               # NestJS module definition for "movie"
│   │   ├── movie.entity.ts               # TypeORM entity representing movies
├── app.module.ts              # Root application module
├── main.ts                    # Application entry point

```
