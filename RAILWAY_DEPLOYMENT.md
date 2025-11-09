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
ALLOWED_ORIGINS=https://burger-house-front.vercel.app
```

**Important:** Railway définit automatiquement la variable `PORT`, ne la définissez pas manuellement.

### Checklist connexion MongoDB Atlas

1. **Autoriser Railway dans MongoDB Atlas**  
   - Dans *Network Access*, ajoutez `0.0.0.0/0` ou l'adresse IP fournie par Railway.
2. **Utilisateur MongoDB**  
   - Vérifiez que l'utilisateur `ivanxpetrovdev` possède le rôle `readWriteAnyDatabase`.
3. **Chaîne de connexion**  
   - Copiez/collez la chaîne `MONGO_URI` ci-dessus **sans espaces**.  
   - Si votre mot de passe contient des caractères spéciaux, encodez-les (`@` → `%40`, etc.).
4. **Redéploiement**  
   - Après toute modification des variables, déclenchez un redeploy pour appliquer les nouveaux secrets.
5. **Logs Railway**  
   - En cas d'erreur 502, ouvrez *Deploy Logs*. Le backend trace désormais toutes les tentatives de connexion MongoDB (`src/config/connectDB.js`) et arrête le serveur si Atlas est inaccessible.

## Configuration CORS

Une fois déployé, vous recevrez une URL Railway (ex: `https://votre-app.railway.app`).

N'oubliez pas de mettre à jour votre frontend pour pointer vers cette nouvelle URL.  
Vous pouvez contrôler les origines autorisées via la variable `ALLOWED_ORIGINS` (séparateur `,`).  
Les origines locales suivantes sont ajoutées automatiquement pour le développement :  
`http://localhost:5173`, `http://127.0.0.1:5173`.  
Exemple : `ALLOWED_ORIGINS=https://burger-house-front.vercel.app,https://admin.votre-domaine.com`.

## Vérification du déploiement

Une fois déployé, testez votre API:

```bash
curl https://votre-app.railway.app/
# ou
curl https://votre-app.railway.app/healthz
```

Vous devriez recevoir: `Welcome to the Burger Shop API!`

## Logs et surveillance

- Consultez les logs en temps réel dans l'interface Railway
- Railway redémarrera automatiquement votre application en cas d'échec

## Mise à jour du déploiement

Railway se redéploie automatiquement à chaque push sur la branche main de votre dépôt GitHub.
