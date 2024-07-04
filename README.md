# Simple School system

- This project about creating a demo project for Simple School System:

## Project Requirements

- That helps in List All Schools, Classes, and Students data.
- Super Admin (only) can update, delete, or create data.

## Installation instructions

- Clone project : `git clone https://github.com/seiftahawy54/School-Managment
- Create `.env` file for environment variables : `touch .env`
- Add important variables before running the app:
    - `NODE_ENV` : to change the project environment depending on where the project will run
    - `MONGO_URI` : to connect the project to MongoDB.
    - `LONG_TOKEN_SECRET` : to secure the tokens
    - `SHORT_TOKEN_SECRET` : to secure the short tokens
    - `NACL_SECRET` : to secure the tokens
- Install dependencies : `yarn install`
    - The app will be accessible at ``http://localhost:5111``
- Run the project in dev mode : `yarn dev`
- To create the API documentation : `yarn doc`

Deployed @ https://school-managment-ydot.onrender.com
