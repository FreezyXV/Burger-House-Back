# Deployment Procedure for Burger Town Application

This README provides detailed instructions for deploying the back-end and front-end components of the Burger Town application.

## Back-end application deployment

The back-end of the app is written in Express/Node.js

Make sure to add your own `.env` file. All the environment variables you will need are listed in the file `env.sample`.

#### To run the project locally:

Install the dependencies:

```
npm install
```

Run the project:

```
npm run dev
```

#### To deploy the project:

- Commit your app to a repository on github.com
- Create an account on Vercel.com
- Create a new project called burger-town-back
- In the secrets section add the environment variable called `MONGO_URL=mongodb://your-mongo-url`
- Link the project to your github repository corresponding to burger-town-back
- Whenever you will push to your github repository, your app will be automatically deployed on vercel.
