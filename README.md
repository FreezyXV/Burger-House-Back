# 🍔 Burger Town - Backend API

## 📋 Table des matières
- [Vue d'ensemble](#-vue-densemble)
- [Architecture](#-architecture)
- [Technologies utilisées](#-technologies-utilisées)
- [Modèles de données](#-modèles-de-données)
- [Routes API](#-routes-api)
- [Authentification](#-authentification)
- [Installation](#-installation)
- [Déploiement](#-déploiement)

---

## 🎯 Vue d'ensemble

Le backend de **Burger Town** est une API REST développée avec **Node.js** et **Express**. Il gère l'ensemble des opérations liées à un restaurant de burgers : gestion des produits, des menus, des utilisateurs et des commandes.

**Fonctionnalités principales :**
- Authentification et gestion des utilisateurs (clients et administrateurs)
- CRUD complet pour les produits (burgers, boissons, accompagnements, sauces, glaces)
- CRUD complet pour les menus (compositions de plusieurs produits)
- Gestion des commandes avec suivi de statut
- Protection des routes sensibles par JWT
- Base de données MongoDB hébergée sur MongoDB Atlas

### 📖 Comment Fonctionne le Backend - Vue d'Ensemble Complète

Le backend est le **cœur de l'application**, agissant comme intermédiaire entre le frontend (interface utilisateur) et la base de données. Voici comment il fonctionne en détail :

**1. Rôle du Backend dans l'Écosystème :**
   ```
   Frontend (React)
        ↓
   [Envoie requête HTTP]
        ↓
   Backend API (Node.js + Express) ← VOUS ÊTES ICI
        ↓
   [Traite la demande]
        ↓
   Base de données (MongoDB)
        ↓
   [Retourne données au frontend]
   ```

**2. Cycle de Vie d'une Requête - Exemple Complet :**

   **Scénario : Un utilisateur veut voir tous les burgers disponibles**

   ```
   ÉTAPE 1 : Réception de la requête
   ─────────────────────────────────
   Le frontend envoie :
   GET https://burger-house-back.fly.dev/api/products?type=Burgers

   ÉTAPE 2 : Routage (routes/productRoutes.js)
   ──────────────────────────────────────────
   Express reçoit la requête et la dirige vers la route correspondante :
   router.get('/', productController.getAllProducts)

   ÉTAPE 3 : Contrôleur (controllers/productController.js)
   ──────────────────────────────────────────────────────
   Le contrôleur exécute la logique métier :
   - Récupère le paramètre de requête : type = "Burgers"
   - Appelle le modèle Mongoose pour interroger la base de données

   ÉTAPE 4 : Modèle (models/product.js)
   ────────────────────────────────────
   Mongoose exécute la requête MongoDB :
   Product.find({ type: "Burgers" })

   ÉTAPE 5 : Base de données (MongoDB Atlas)
   ────────────────────────────────────────
   MongoDB recherche tous les documents dans la collection "products"
   où le champ "type" est égal à "Burgers"

   ÉTAPE 6 : Retour des données
   ───────────────────────────
   Les données remontent la chaîne :
   MongoDB → Mongoose → Contrôleur → Express → Frontend

   Réponse JSON :
   [
     { _id: "...", title: "Classic Burger", price: 8.50, ... },
     { _id: "...", title: "Cheese Burger", price: 9.00, ... },
     ...
   ]
   ```

**3. Authentification JWT - Comment Ça Marche :**

   **A. Inscription d'un nouvel utilisateur :**
   ```
   Frontend → POST /api/users/register
              Body: { username, password, email, ... }
                ↓
   Backend reçoit les données
                ↓
   userController.registerUser() est appelé
                ↓
   1. Valide les données (express-validator)
   2. Vérifie si l'utilisateur existe déjà
   3. Hashe le mot de passe avec bcrypt :
      password "motdepasse123" → "$2a$10$XYZ..." (impossible à inverser)
   4. Crée l'utilisateur dans MongoDB
   5. Retourne succès
   ```

   **B. Connexion d'un utilisateur :**
   ```
   Frontend → POST /api/users/login
              Body: { username, password }
                ↓
   Backend vérifie les identifiants
                ↓
   1. Trouve l'utilisateur par username
   2. Compare le mot de passe hashé avec bcrypt.compare()
   3. Si valide, génère un JWT token :
      Token = jwt.sign(
        { userId: user._id, isAdmin: user.isAdmin },
        JWT_SECRET,
        { expiresIn: '24h' }
      )
   4. Retourne le token au frontend
                ↓
   Frontend stocke le token dans localStorage
   ```

   **C. Accès à une route protégée :**
   ```
   Frontend → POST /api/products/add (créer un produit)
              Headers: { Authorization: "Bearer <token>" }
              Body: { title, price, ... }
                ↓
   Backend applique le middleware auth.js
                ↓
   Middleware auth :
   1. Extrait le token du header Authorization
   2. Vérifie le token avec jwt.verify(token, JWT_SECRET)
   3. Si valide, décode les données : { userId, isAdmin }
   4. Ajoute ces infos à req.user
   5. Passe au contrôleur suivant
                ↓
   productController.createProduct() :
   - Vérifie req.user.isAdmin === true
   - Si oui, crée le produit
   - Si non, retourne erreur 403 Forbidden
   ```

**4. Gestion des Commandes - Workflow Complet :**

   ```
   Client passe une commande depuis le panier
                ↓
   Frontend → POST /api/orders/add
              Body: {
                customer: "user_id_123",
                items: [
                  { itemRef: "product_id_1", onModel: "Product", quantity: 2 },
                  { itemRef: "menu_id_5", onModel: "Menu", quantity: 1 }
                ],
                totalPrice: 35.50
              }
                ↓
   orderController.submitBackOrder() :

   1. Validation des données :
      - customer existe-t-il ? (vérification dans collection Users)
      - items est-il un tableau non vide ?
      - totalPrice est-il un nombre valide ?

   2. Création du document Order :
      const newOrder = new Order({
        customer: ObjectId(customer),
        items: items.map(item => ({
          itemRef: ObjectId(item.itemRef),
          onModel: item.onModel,
          quantity: item.quantity
        })),
        totalPrice: totalPrice,
        status: "pending"
      });

   3. Sauvegarde dans MongoDB :
      await newOrder.save()

   4. Réponse au frontend :
      { success: true, order: newOrder }
                ↓
   Frontend affiche confirmation et vide le panier
   ```

**5. Sécurité - Couches de Protection :**

   **Niveau 1 : Validation des données (express-validator)**
   ```javascript
   // Exemple : Validation de création de produit
   router.post('/add',
     body('title').notEmpty().withMessage('Le titre est requis'),
     body('price').isNumeric().withMessage('Le prix doit être un nombre'),
     // ...
     productController.createProduct
   );
   ```

   **Niveau 2 : Authentification (JWT)**
   ```javascript
   // Seuls les utilisateurs connectés peuvent accéder
   router.post('/add', auth, productController.createProduct);
   ```

   **Niveau 3 : Autorisation (vérification des permissions)**
   ```javascript
   // Dans le contrôleur
   if (!req.user.isAdmin) {
     return res.status(403).json({ error: "Accès refusé" });
   }
   ```

   **Niveau 4 : Hachage des mots de passe (bcrypt)**
   ```javascript
   // Jamais de mots de passe en clair !
   const hashedPassword = await bcrypt.hash(password, 10);
   ```

   **Niveau 5 : CORS (Cross-Origin Resource Sharing)**
   ```javascript
   // Seul le frontend autorisé peut appeler l'API
   app.use(cors({
     origin: "https://burger-house-front.vercel.app"
   }));
   ```

**6. Structure des Données - Relations MongoDB :**

   ```
   Collection "users"
   ┌─────────────────────────┐
   │ _id: ObjectId("abc123") │
   │ username: "john_doe"    │
   │ password: "$2a$10$..."  │ ← Hashé, jamais en clair
   │ isAdmin: false          │
   └─────────────────────────┘
             ↑
             │ Référencé par
             │
   Collection "orders"
   ┌──────────────────────────────────┐
   │ _id: ObjectId("order123")        │
   │ customer: ObjectId("abc123") ────┘ (Référence vers User)
   │ items: [                         │
   │   {                              │
   │     itemRef: ObjectId("burger1"),│ ─→ Référence vers Product
   │     onModel: "Product",          │
   │     quantity: 2                  │
   │   },                             │
   │   {                              │
   │     itemRef: ObjectId("menu5"),  │ ─→ Référence vers Menu
   │     onModel: "Menu",             │
   │     quantity: 1                  │
   │   }                              │
   │ ],                               │
   │ totalPrice: 35.50,               │
   │ status: "pending"                │
   └──────────────────────────────────┘
   ```

**7. Variables d'Environnement - Configuration :**

   ```env
   # Fichier .env (JAMAIS commité sur Git !)

   PORT=2233
   # Port sur lequel le serveur écoute

   MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/burgerDB
   # Chaîne de connexion MongoDB Atlas
   # Format : mongodb+srv://<utilisateur>:<motdepasse>@<cluster>/<database>

   JWT_SECRET=ma_cle_secrete_ultra_longue_et_complexe_123456
   # Clé pour signer les JWT (doit être TRÈS sécurisée)
   # Si quelqu'un obtient cette clé, il peut créer des tokens valides !
   ```

**8. Déploiement sur Fly.io - Comment Ça Marche :**

   ```
   Développement local (http://localhost:2233)
                ↓
   Commit des changements sur Git
                ↓
   Commande : flyctl deploy
                ↓
   Fly.io :
   1. Lit le Dockerfile
   2. Construit l'image Docker avec Node.js et les dépendances
   3. Démarre le conteneur
   4. Configure les variables d'environnement (secrets Fly.io)
   5. Active HTTPS automatiquement
   6. Assigne l'URL : https://burger-house-back.fly.dev
                ↓
   Application accessible mondialement avec :
   - HTTPS activé (certificat SSL automatique)
   - Redémarrage automatique en cas d'erreur
   - Scaling automatique selon le trafic
   - Logs accessibles via : flyctl logs
   ```

**9. Monitoring et Debugging :**

   **Vérifier si le serveur fonctionne :**
   ```bash
   # En local
   npm run dev
   # Ouvrir : http://localhost:2233
   # Devrait afficher : "Welcome to the Burger Shop API!"

   # En production
   curl https://burger-house-back.fly.dev
   # Devrait retourner : "Welcome to the Burger Shop API!"
   ```

   **Tester une route :**
   ```bash
   # Récupérer tous les produits
   curl https://burger-house-back.fly.dev/api/products

   # Connexion utilisateur
   curl -X POST https://burger-house-back.fly.dev/api/users/login \
     -H "Content-Type: application/json" \
     -d '{"username":"test","password":"test123"}'
   ```

   **Logs d'erreur :**
   ```bash
   # Production (Fly.io)
   flyctl logs

   # Développement
   Les erreurs s'affichent directement dans le terminal
   ```

**10. Points Clés à Retenir :**

   - Le backend ne stocke PAS de sessions (stateless grâce aux JWT)
   - Chaque requête est indépendante et doit contenir le token si elle est protégée
   - MongoDB stocke les données sous forme de documents JSON flexibles
   - Mongoose ajoute une couche de validation et de structure aux documents
   - Les mots de passe sont TOUJOURS hachés avant stockage (bcrypt)
   - CORS protège l'API contre les accès non autorisés depuis d'autres domaines
   - Les variables d'environnement (.env) gardent les secrets hors du code
   - Le pattern MVC (Model-View-Controller) organise le code de manière logique

**Cette API backend est le pilier central qui permet à l'application Burger Town de fonctionner de manière sécurisée, scalable et maintenable.**

---

## 🏗️ Architecture

L'application suit une architecture **MVC (Model-View-Controller)** organisée de manière claire :

```
Back/
├── src/
│   ├── index.js              # Point d'entrée de l'application
│   ├── models/               # Schémas Mongoose (structure des données)
│   │   ├── user.js           # Modèle utilisateur
│   │   ├── product.js        # Modèle produit
│   │   ├── menu.js           # Modèle menu
│   │   ├── order.js          # Modèle commande
│   │   └── orderItem.js      # Modèle élément de commande
│   ├── controllers/          # Logique métier (traitements)
│   │   ├── userController.js
│   │   ├── productController.js
│   │   ├── menuController.js
│   │   └── orderController.js
│   ├── routes/               # Définition des endpoints API
│   │   ├── userRoutes.js
│   │   ├── productRoutes.js
│   │   ├── menuRoutes.js
│   │   └── orderRoutes.js
│   ├── middlewares/          # Middlewares (auth, validation...)
│   │   └── auth.js           # Middleware d'authentification JWT
│   ├── api/                  # Fonctions utilitaires
│   │   └── functions.js
│   └── scripts/              # Scripts de maintenance/migration
├── .env                      # Variables d'environnement
├── package.json
└── Dockerfile
```

### Flux de fonctionnement

```
Client (Frontend)
      ↓
   [Requête HTTP]
      ↓
Express Server (index.js)
      ↓
   [Middleware CORS]
      ↓
   [Routes] → /api/users, /api/products, /api/menus, /api/orders
      ↓
   [Middleware Auth] (si route protégée)
      ↓
   [Controllers] → Logique métier
      ↓
   [Models] → Interaction avec MongoDB
      ↓
MongoDB Atlas (Base de données cloud)
      ↓
   [Réponse JSON]
      ↓
Client (Frontend)
```

---

## 🛠️ Technologies utilisées

| Technologie | Usage |
|------------|-------|
| **Node.js** | Environnement d'exécution JavaScript côté serveur |
| **Express** | Framework web minimaliste pour créer l'API REST |
| **MongoDB** | Base de données NoSQL orientée documents |
| **Mongoose** | ODM (Object Data Modeling) pour MongoDB - facilite les opérations sur la base |
| **JWT (jsonwebtoken)** | Génération et vérification des tokens d'authentification |
| **bcryptjs** | Hachage sécurisé des mots de passe |
| **cors** | Gestion des requêtes cross-origin (permet au frontend d'appeler l'API) |
| **dotenv** | Chargement des variables d'environnement |
| **express-validator** | Validation des données entrantes |
| **nodemailer** | Envoi d'emails (notifications, confirmations) |

---

## 📊 Modèles de données

### 1. User (Utilisateur)
Représente un utilisateur de l'application (client ou administrateur).

```javascript
{
  username: String (unique, requis),
  password: String (haché, requis),
  name: String (requis),
  surname: String,
  email: String (requis),
  phone: String,
  address: String,
  zipcode: String,
  city: String,
  dateOfBirth: Date,
  isAdmin: Boolean (par défaut: false)
}
```

### 2. Product (Produit)
Représente un produit individuel du menu.

```javascript
{
  title: String (requis),
  description: String,
  price: Number,
  inStock: Boolean (par défaut: true),
  imageSrc: String (URL de l'image, requis),
  type: String (enum: ["Burgers", "Boissons", "Accompagnements", "Sauces", "Glaces"])
}
```

### 3. Menu
Représente un menu composé de plusieurs produits.

```javascript
{
  title: String (requis),
  description: String,
  price: Number,
  inStock: Boolean (par défaut: true),
  imageSrc: String (URL de l'image, requis),
  type: String (toujours "Menu"),
  size: String (enum: ["medium", "large"]),
  products: [ObjectId] (références aux produits inclus dans le menu)
}
```

### 4. Order (Commande)
Représente une commande passée par un client.

```javascript
{
  items: [OrderItem] (liste des articles commandés),
  totalPrice: Number (requis),
  status: String (enum: ["pending", "processed", "ready"], par défaut: "pending"),
  customer: ObjectId (référence vers l'utilisateur),
  timestamps: true (createdAt, updatedAt automatiques)
}
```

### 5. OrderItem (Élément de commande)
Représente un article dans une commande (peut être un produit ou un menu).

```javascript
{
  itemRef: ObjectId (référence dynamique),
  onModel: String (enum: ["Menu", "Product"] - indique le type d'item),
  quantity: Number (minimum: 1, requis),
  selectedOptions: {
    size: String (enum: ["medium", "large"])
  }
}
```

**Note :** Le système utilise le pattern **polymorphique** avec `refPath` pour permettre à un OrderItem de référencer soit un Menu, soit un Product.

---

## 🔌 Routes API

### 🔐 Routes Utilisateurs (`/api/users`)

| Méthode | Route | Protection | Description |
|---------|-------|-----------|-------------|
| POST | `/register` | ❌ Public | Inscription d'un nouvel utilisateur |
| POST | `/login` | ❌ Public | Connexion (retourne un JWT) |
| GET | `/` | ✅ Auth | Liste tous les utilisateurs (admin) |
| GET | `/:id` | ✅ Auth | Récupère un utilisateur par ID |
| PUT | `/:id` | ✅ Auth | Met à jour un utilisateur |
| DELETE | `/:id` | ✅ Auth | Supprime un utilisateur |
| PUT | `/change-password/:userId` | ✅ Auth | Change le mot de passe |

### 🍔 Routes Produits (`/api/products`)

| Méthode | Route | Protection | Description |
|---------|-------|-----------|-------------|
| GET | `/` | ❌ Public | Liste tous les produits |
| GET | `/:id` | ❌ Public | Récupère un produit par ID |
| POST | `/add` | ✅ Auth | Crée un nouveau produit (admin) |
| PUT | `/modify/:id` | ✅ Auth | Met à jour un produit (admin) |
| DELETE | `/delete/:id` | ✅ Auth | Supprime un produit (admin) |

### 🍟 Routes Menus (`/api/menus`)

| Méthode | Route | Protection | Description |
|---------|-------|-----------|-------------|
| GET | `/` | ❌ Public | Liste tous les menus |
| GET | `/:id` | ❌ Public | Récupère un menu par ID avec ses produits (populate) |
| POST | `/add` | ✅ Auth | Crée un nouveau menu (admin) |
| PUT | `/modify/:id` | ✅ Auth | Met à jour un menu (admin) |
| DELETE | `/delete/:id` | ✅ Auth | Supprime un menu (admin) |

### 📦 Routes Commandes (`/api/orders`)

| Méthode | Route | Protection | Description |
|---------|-------|-----------|-------------|
| GET | `/` | ❌ Public | Liste toutes les commandes |
| POST | `/add` | ❌ Public | Crée une nouvelle commande |

**Note :** Les routes marquées ✅ Auth nécessitent un token JWT valide dans le header `Authorization: Bearer <token>`.

---

## 🔐 Authentification

L'application utilise **JWT (JSON Web Tokens)** pour sécuriser les routes sensibles.

### Processus d'authentification

1. **Inscription/Connexion** :
   - L'utilisateur s'inscrit (`/api/users/register`) ou se connecte (`/api/users/login`)
   - Le mot de passe est haché avec **bcryptjs** avant d'être stocké
   - En cas de succès, le serveur génère un **JWT** contenant :
     ```javascript
     {
       userId: user._id,
       isAdmin: user.isAdmin
     }
     ```
   - Ce token est signé avec la clé secrète `JWT_SECRET` (définie dans `.env`)

2. **Utilisation du token** :
   - Le frontend stocke le token (localStorage)
   - Pour chaque requête vers une route protégée, le token est envoyé dans le header :
     ```
     Authorization: Bearer <token>
     ```

3. **Vérification** :
   - Le middleware `auth.js` intercepte les requêtes vers les routes protégées
   - Il vérifie la validité du token avec `jwt.verify()`
   - Si valide, il extrait les informations utilisateur et les ajoute à `req.user`
   - Si invalide/absent, il retourne une erreur 401 (Unauthorized)

### Middleware d'authentification

```javascript
// Exemple d'utilisation dans les routes
router.post('/add', auth, productController.createProduct);
//                  ↑
//                  Le middleware auth vérifie le token avant d'exécuter le controller
```

---

## 🚀 Installation

### Prérequis
- **Node.js** (v14 ou supérieur)
- **npm** ou **yarn**
- Compte **MongoDB Atlas** (ou instance MongoDB locale)

### Étapes

1. **Cloner le repository**
   ```bash
   cd Back
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement**

   Créer un fichier `.env` à la racine du dossier `Back/` :
   ```env
   PORT=2233
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/burgerDB
   JWT_SECRET=votre_cle_secrete_tres_longue_et_complexe
   ```

   - `PORT` : Port sur lequel le serveur écoute
   - `MONGO_URI` : Chaîne de connexion MongoDB Atlas
   - `JWT_SECRET` : Clé secrète pour signer les JWT (doit être sécurisée)

4. **Démarrer le serveur**

   **Mode développement** (avec rechargement automatique) :
   ```bash
   npm run dev
   ```

   **Mode production** :
   ```bash
   npm start
   ```

5. **Vérifier le fonctionnement**

   Ouvrir un navigateur ou Postman et tester :
   ```
   http://localhost:2233/
   ```

   Réponse attendue : `"Welcome to the Burger Shop API!"`

---

## 🌐 Déploiement

L'application est déployée sur **Fly.io** (plateforme cloud).

### Configuration Fly.io

Le fichier `fly.toml` contient la configuration de déploiement :
```toml
app = 'burger-house-back'
primary_region = 'cdg'

[http_service]
  internal_port = 2233
  force_https = true
  auto_stop_machines = 'stop'
  auto_start_machines = true
  min_machines_running = 0
  processes = ['app']
```

### Déployer sur Fly.io

1. **Installer Fly CLI**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Se connecter**
   ```bash
   flyctl auth login
   ```

3. **Déployer**
   ```bash
   flyctl deploy
   ```

4. **Définir les secrets (variables d'environnement)**
   ```bash
   flyctl secrets set MONGO_URI="mongodb+srv://..."
   flyctl secrets set JWT_SECRET="votre_secret"
   ```

### URL de production
Une fois déployé, l'API est accessible à :
```
https://burger-house-back.fly.dev
```

---

## 📖 Relation avec le Frontend et la Base de données

```
┌─────────────────────────────────────────────────────────────┐
│                    ARCHITECTURE COMPLÈTE                     │
└─────────────────────────────────────────────────────────────┘

Frontend (React + Vite)
  │ Hébergé sur Vercel
  │ https://burger-house-front.vercel.app
  │
  ├─ Gestion de l'état local (useState, localStorage)
  ├─ Routing avec React Router
  └─ Appels API avec fetch/axios
      │
      ↓ Requêtes HTTP (GET, POST, PUT, DELETE)
      │
Backend API (Node.js + Express)
  │ Hébergé sur Fly.io
  │ https://burger-house-back.fly.dev
  │
  ├─ Middleware CORS (autorise les requêtes du frontend)
  ├─ Middleware Auth (vérifie les JWT pour les routes protégées)
  ├─ Routes + Controllers (logique métier)
  └─ Models Mongoose (structure des données)
      │
      ↓ Requêtes Mongoose (find, create, update, delete)
      │
Base de données (MongoDB Atlas)
  │ Hébergé sur le cloud MongoDB
  │ Cluster : ClusterZero
  │ Base : burgerDB
  │
  └─ Collections :
      ├─ users
      ├─ products
      ├─ menus
      └─ orders
```

### Exemple de flux complet : Passer une commande

1. **Frontend** : L'utilisateur clique sur "Commander"
   ```javascript
   // Front/src/pages/CartAndOrderSummary.jsx
   const response = await fetch('https://burger-house-back.fly.dev/api/orders/add', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ items, totalPrice, customer })
   });
   ```

2. **Backend** : Réception de la requête
   ```javascript
   // Back/src/routes/orderRoutes.js
   router.post('/add', orderController.submitBackOrder);
   ```

3. **Controller** : Traitement de la commande
   ```javascript
   // Back/src/controllers/orderController.js
   const newOrder = new Order({ items, totalPrice, customer });
   await newOrder.save(); // Sauvegarde dans MongoDB
   ```

4. **MongoDB** : Stockage de la commande dans la collection `orders`

5. **Réponse** : Le backend renvoie la commande créée au frontend

---

## 📝 Notes importantes

- **Sécurité** : Ne jamais committer le fichier `.env` (utiliser `.gitignore`)
- **Mots de passe** : Toujours hasher avec bcrypt (jamais en clair)
- **CORS** : L'origine autorisée est configurée pour le frontend Vercel
- **Validation** : Utiliser express-validator pour valider les données entrantes
- **Erreurs** : Le middleware global de gestion des erreurs capture toutes les exceptions

---

## 🤝 Contribution

Pour contribuer au projet :
1. Créer une branche pour la fonctionnalité
2. Écrire des tests si applicable
3. Respecter la structure MVC existante
4. Commenter le code de manière claire

---

## 📧 Support

Pour toute question ou problème :
- Vérifier les logs du serveur avec `npm run dev`
- Consulter la documentation MongoDB : https://docs.mongodb.com
- Consulter la documentation Express : https://expressjs.com

---

**Bon développement ! 🍔**
