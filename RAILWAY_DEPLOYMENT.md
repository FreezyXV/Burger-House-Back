# Déploiement sur Railway

Ce guide explique comment déployer votre backend Burger House sur Railway.

## Prérequis

1. Un compte Railway (https://railway.app)
2. Railway CLI (optionnel): `npm i -g @railway/cli`

## Étapes de déploiement

### Option 1: Via l'interface web Railway

1. Connectez-vous à https://railway.app
2. Cliquez sur "New Project"
3. Sélectionnez "Deploy from GitHub repo"
4. Autorisez Railway à accéder à votre dépôt GitHub
5. Sélectionnez le dépôt `Burger-House-Back`
6. Railway détectera automatiquement le Dockerfile

### Option 2: Via Railway CLI

```bash
# Installer Railway CLI
npm i -g @railway/cli

# Se connecter à Railway
railway login

# Initialiser le projet
railway init

# Déployer
railway up
```

## Variables d'environnement à configurer sur Railway

Dans l'interface Railway, allez dans votre projet > Variables et ajoutez:

```
MONGO_URI=mongodb+srv://ivanxpetrovdev:Qwerty123@clusterzero.bazw0.mongodb.net/burgerDB?retryWrites=true&w=majority&appName=ClusterZero
JWT_SECRET=qazwsxedcrfv
NODE_ENV=production
```

**Important:** Railway définit automatiquement la variable `PORT`, ne la définissez pas manuellement.

## Configuration CORS

Une fois déployé, vous recevrez une URL Railway (ex: `https://votre-app.railway.app`).

N'oubliez pas de mettre à jour votre frontend pour pointer vers cette nouvelle URL et d'ajouter l'URL frontend dans la configuration CORS du fichier `src/index.js` si nécessaire.

## Vérification du déploiement

Une fois déployé, testez votre API:

```bash
curl https://votre-app.railway.app/
```

Vous devriez recevoir: `Welcome to the Burger Shop API!`

## Logs et surveillance

- Consultez les logs en temps réel dans l'interface Railway
- Railway redémarrera automatiquement votre application en cas d'échec

## Mise à jour du déploiement

Railway se redéploie automatiquement à chaque push sur la branche main de votre dépôt GitHub.
