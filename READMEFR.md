# Burger Town - API Backend

## Table des matières
- [Vue d'ensemble](#vue-densemble)
- [Comment Fonctionne le Backend - Guide Complet](#comment-fonctionne-le-backend---guide-complet)
- [Architecture](#architecture)
- [Stack Technologique](#stack-technologique)
- [Modèles de Base de Données](#modèles-de-base-de-données)
- [Routes API](#routes-api)
- [Authentification et Autorisation](#authentification-et-autorisation)
- [Flux de Données](#flux-de-données)
- [Installation](#installation)
- [Déploiement](#déploiement)
- [Notes Importantes](#notes-importantes)

---

## Vue d'ensemble

Le backend de **Burger Town** est une API RESTful construite avec **Node.js** et **Express**. Il gère toutes les opérations d'une application de restauration de burgers : produits, menus, utilisateurs et commandes.

**Fonctionnalités Principales :**
- Authentification et gestion des utilisateurs (clients et administrateurs)
- Opérations CRUD complètes pour les produits (burgers, boissons, accompagnements, sauces, desserts)
- Opérations CRUD complètes pour les menus (combinaisons de produits)
- Gestion des commandes avec suivi de statut
- Routes protégées par JWT pour les opérations sensibles
- Base de données MongoDB Atlas dans le cloud

---

## Comment Fonctionne le Backend - Guide Complet

### 1. Rôle du Backend dans l'Écosystème

Le backend est le **cœur de l'application**, agissant comme intermédiaire entre le frontend (interface utilisateur) et la base de données.

```
┌─────────────────────────────────────────────────────────────┐
│                    ARCHITECTURE COMPLÈTE                     │
└─────────────────────────────────────────────────────────────┘

Frontend (React + Vite)
  │ Hébergé sur Vercel
  │ https://burger-house-front.vercel.app
  │
  ├─ Gestion d'état local (useState, localStorage)
  ├─ Routing avec React Router
  └─ Appels API avec fetch/axios
      │
      ↓ Requêtes HTTP (GET, POST, PUT, DELETE)
      │
Backend API (Node.js + Express)  ← VOUS ÊTES ICI
  │ Hébergé sur Render
  │ https://burger-house-back.onrender.com
  │
  ├─ Middleware CORS (autorise les requêtes du frontend)
  ├─ Middleware Auth (vérifie JWT pour les routes protégées)
  ├─ Routes + Controllers (logique métier)
  └─ Modèles Mongoose (structure de données)
      │
      ↓ Requêtes Mongoose (find, create, update, delete)
      │
Base de données (MongoDB Atlas)
  │ MongoDB hébergé dans le cloud
  │ Cluster: ClusterZero
  │ Base de données: burgerDB
  │
  └─ Collections:
      ├─ users
      ├─ products
      ├─ menus
      └─ orders
```

### 2. Cycle de Vie d'une Requête - Exemple Complet

**Scénario : Un utilisateur veut voir tous les burgers disponibles**

```
ÉTAPE 1 : Réception de la requête
──────────────────────────────────
Le frontend envoie :
GET https://burger-house-back.onrender.com/api/products?type=Burgers

ÉTAPE 2 : Routage (routes/productRoutes.js)
────────────────────────────────────────────
Express reçoit la requête et la dirige vers la route correspondante :
router.get('/', productController.getAllProducts)

ÉTAPE 3 : Contrôleur (controllers/productController.js)
────────────────────────────────────────────────────────
Le contrôleur exécute la logique métier :
- Récupère le paramètre de requête : type = "Burgers"
- Appelle le modèle Mongoose pour interroger la base de données

ÉTAPE 4 : Modèle (models/product.js)
─────────────────────────────────────
Mongoose exécute la requête MongoDB :
Product.find({ type: "Burgers" })

ÉTAPE 5 : Base de données (MongoDB Atlas)
──────────────────────────────────────────
MongoDB recherche tous les documents dans la collection "products"
où le champ "type" est égal à "Burgers"

ÉTAPE 6 : Retour des données
─────────────────────────────
Les données remontent la chaîne :
MongoDB → Mongoose → Contrôleur → Express → Frontend

Réponse JSON :
[
  { _id: "...", title: "Classic Burger", price: 8.50, ... },
  { _id: "...", title: "Cheese Burger", price: 9.00, ... },
  ...
]
```

### 3. Authentification JWT - Comment Ça Marche

```mermaid
sequenceDiagram
    participant User as Utilisateur
    participant Frontend
    participant Backend
    participant Database as Base de données

    Note over User,Database: Flux d'Inscription
    User->>Frontend: Remplit le formulaire d'inscription
    Frontend->>Backend: POST /api/users/register
    Backend->>Backend: Valider les données
    Backend->>Backend: Hacher le mot de passe (bcrypt)
    Backend->>Database: Sauvegarder l'utilisateur
    Database-->>Backend: Utilisateur créé
    Backend-->>Frontend: Réponse de succès
    Frontend-->>User: Inscription réussie

    Note over User,Database: Flux de Connexion
    User->>Frontend: Saisit les identifiants
    Frontend->>Backend: POST /api/users/login
    Backend->>Database: Trouver utilisateur par nom d'utilisateur
    Database-->>Backend: Données utilisateur
    Backend->>Backend: Comparer le hash du mot de passe
    Backend->>Backend: Générer token JWT
    Backend-->>Frontend: {token, user}
    Frontend->>Frontend: Stocker token dans localStorage
    Frontend-->>User: Connexion réussie

    Note over User,Database: Accès à Route Protégée
    User->>Frontend: Crée un nouveau produit
    Frontend->>Backend: POST /api/products/add<br/>Header: Authorization Bearer <token>
    Backend->>Backend: Middleware Auth valide le token
    Backend->>Backend: RequireAdmin vérifie les permissions
    Backend->>Database: Créer le produit
    Database-->>Backend: Produit créé
    Backend-->>Frontend: Données du produit
    Frontend-->>User: Produit créé avec succès
```

**A. Inscription Utilisateur :**
```
Frontend → POST /api/users/register
           Body: { username, password, email, ... }
             ↓
Le backend reçoit les données
             ↓
userController.registerUser() est appelé
             ↓
1. Valide les données (express-validator)
2. Vérifie si l'utilisateur existe déjà
3. Hache le mot de passe avec bcrypt :
   mot de passe "motdepasse123" → "$2a$10$XYZ..." (irréversible)
4. Crée l'utilisateur dans MongoDB
5. Retourne succès
```

**B. Connexion Utilisateur :**
```
Frontend → POST /api/users/login
           Body: { username, password }
             ↓
Le backend vérifie les identifiants
             ↓
1. Trouve l'utilisateur par nom d'utilisateur
2. Compare le hash du mot de passe avec bcrypt.compare()
3. Si valide, génère un token JWT :
   Token = jwt.sign(
     { userId: user._id, isAdmin: user.isAdmin },
     JWT_SECRET,
     { expiresIn: '7d' }
   )
4. Retourne le token au frontend
             ↓
Le frontend stocke le token dans localStorage
```

**C. Accès à une Route Protégée :**
```
Frontend → POST /api/products/add (créer un produit)
           Headers: { Authorization: "Bearer <token>" }
           Body: { title, price, ... }
             ↓
Le backend applique le middleware auth.js
             ↓
Middleware Auth :
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

### 4. Gestion des Commandes - Workflow Complet

```mermaid
flowchart TD
    A[Utilisateur ajoute articles au panier] --> B[Utilisateur clique sur 'Commander']
    B --> C[Frontend: POST /api/orders/add]
    C --> D{Middleware Auth}
    D -->|Token Valide| E[orderController.submitBackOrder]
    D -->|Token Invalide| F[Retour 401 Non Autorisé]
    E --> G{Valider Données Commande}
    G -->|Invalide| H[Retour 400 Mauvaise Requête]
    G -->|Valide| I[Créer Document Commande]
    I --> J[Sauvegarder dans MongoDB]
    J --> K[Retourner Confirmation Commande]
    K --> L[Frontend affiche succès]
    L --> M[Vider le panier]
```

**Exemple de Requête :**
```
Le client passe une commande depuis le panier
             ↓
Frontend → POST /api/orders/add
           Body: {
             items: [
               { itemRef: "product_id_1", onModel: "Product", quantity: 2 },
               { itemRef: "menu_id_5", onModel: "Menu", quantity: 1 }
             ],
             totalPrice: 35.50
           }
             ↓
orderController.submitBackOrder() :

1. Validation des données :
   - items est un tableau non vide ?
   - totalPrice est un nombre valide ?
   - l'utilisateur est authentifié ?

2. Créer le document Commande :
   const newOrder = new Order({
     customer: req.user.id,
     items: items.map(item => ({
       itemRef: ObjectId(item.itemRef),
       onModel: item.onModel,
       quantity: item.quantity
     })),
     totalPrice: totalPrice,
     status: "pending"
   });

3. Sauvegarder dans MongoDB :
   await newOrder.save()

4. Réponse au frontend :
   { success: true, order: newOrder }
             ↓
Le frontend affiche la confirmation et vide le panier
```

### 5. Sécurité - Couches de Protection

```mermaid
graph TD
    A[Requête Client] --> B[Couche 1: Validation Entrée]
    B --> C[Couche 2: Vérification CORS]
    C --> D[Couche 3: Authentification JWT]
    D --> E[Couche 4: Vérification Autorisation]
    E --> F[Couche 5: Hachage Mot de Passe]
    F --> G[Exécution Logique Métier]
    G --> H[Opération Base de Données]
    H --> I[Réponse au Client]

    style B fill:#ff6b6b
    style C fill:#feca57
    style D fill:#48dbfb
    style E fill:#1dd1a1
    style F fill:#ee5a6f
```

**Couche 1 : Validation d'Entrée (express-validator)**
```javascript
// Exemple : Validation de création de produit
router.post('/add',
  body('title').notEmpty().withMessage('Le titre est requis'),
  body('price').isNumeric().withMessage('Le prix doit être un nombre'),
  // ...
  productController.createProduct
);
```

**Couche 2 : CORS (Cross-Origin Resource Sharing)**
```javascript
// Seul le frontend autorisé peut appeler l'API
app.use(cors({
  origin: ["https://burger-house-front.vercel.app", "http://localhost:5173"]
}));
```

**Couche 3 : Authentification (JWT)**
```javascript
// Seuls les utilisateurs connectés peuvent accéder
router.post('/add', auth, productController.createProduct);
```

**Couche 4 : Autorisation (vérification des permissions)**
```javascript
// Dans le contrôleur
if (!req.user.isAdmin) {
  return res.status(403).json({ error: "Accès refusé" });
}
```

**Couche 5 : Hachage des Mots de Passe (bcrypt)**
```javascript
// Jamais de mots de passe en clair !
const hashedPassword = await bcrypt.hash(password, 10);
```

### 6. Relations Base de Données - Structure MongoDB

```mermaid
erDiagram
    USER ||--o{ ORDER : passe
    ORDER ||--|{ ORDER_ITEM : contient
    PRODUCT ||--o{ ORDER_ITEM : "référencé par"
    MENU ||--o{ ORDER_ITEM : "référencé par"
    MENU }o--o{ PRODUCT : inclut

    USER {
        ObjectId _id PK
        string username UK
        string password
        string email
        boolean isAdmin
        string name
    }

    PRODUCT {
        ObjectId _id PK
        string title
        number price
        string type
        string imageSrc
        boolean inStock
    }

    MENU {
        ObjectId _id PK
        string title
        number price
        string size
        string imageSrc
        ObjectId[] products FK
    }

    ORDER {
        ObjectId _id PK
        ObjectId customer FK
        number totalPrice
        string status
        date createdAt
    }

    ORDER_ITEM {
        ObjectId itemRef FK
        string onModel
        number quantity
        object selectedOptions
    }
```

**Exemple de Relations de Données :**
```
Collection "users"
┌─────────────────────────┐
│ _id: ObjectId("abc123") │
│ username: "jean_dupont" │
│ password: "$2a$10$..."  │ ← Haché, jamais en clair
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

### 7. Variables d'Environnement - Configuration

```env
# Fichier .env (NE JAMAIS commiter sur Git !)

PORT=2233
# Port sur lequel le serveur écoute

MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/burgerDB
# Chaîne de connexion MongoDB Atlas
# Format : mongodb+srv://<utilisateur>:<motdepasse>@<cluster>/<database>

JWT_SECRET=ma_cle_secrete_ultra_longue_et_complexe_123456
# Clé pour signer les JWT (doit être TRÈS sécurisée)
# Si quelqu'un obtient cette clé, il peut créer des tokens valides !

ALLOWED_ORIGINS=https://votre-frontend.vercel.app,http://localhost:5173
# Liste séparée par virgules des origines CORS autorisées
```

### 8. Déploiement sur Render - Comment Ça Marche

```mermaid
graph LR
    A[Développement Local<br/>localhost:2233] --> B[Commit Git]
    B --> C[Push vers GitHub]
    C --> D[Plateforme Render]
    D --> E[Détecte les Changements]
    E --> F[Construire Image Docker]
    F --> G[Démarrer Conteneur]
    G --> H[Configurer Environnement]
    H --> I[Activer HTTPS]
    I --> J[Déployer en Production<br/>burger-house-back.onrender.com]

    style A fill:#e1f5fe
    style J fill:#a5d6a7
```

**Processus de Déploiement :**
```
Développement Local (http://localhost:2233)
             ↓
Commit des changements sur Git
             ↓
Push vers le dépôt GitHub
             ↓
Render :
1. Détecte automatiquement le nouveau commit
2. Construit l'image Docker avec Node.js et les dépendances
3. Démarre le conteneur
4. Configure les variables d'environnement (secrets Render)
5. Active HTTPS automatiquement
6. Assigne l'URL : https://burger-house-back.onrender.com
             ↓
Application accessible mondialement avec :
- HTTPS activé (certificat SSL automatique)
- Redémarrage automatique en cas d'erreur
- Auto-scaling selon le trafic
- Logs accessibles via le tableau de bord Render
```

### 9. Points Clés à Retenir

- Le backend ne stocke PAS de sessions (stateless grâce aux JWT)
- Chaque requête est indépendante et doit contenir le token si elle est protégée
- MongoDB stocke les données sous forme de documents JSON flexibles
- Mongoose ajoute une couche de validation et de structure aux documents
- Les mots de passe sont TOUJOURS hachés avant stockage (bcrypt)
- CORS protège l'API contre les accès non autorisés depuis d'autres domaines
- Les variables d'environnement (.env) gardent les secrets hors du code
- Le pattern MVC (Model-View-Controller) organise le code de manière logique

**Cette API backend est le pilier central qui permet à l'application Burger Town de fonctionner de manière sécurisée, évolutive et maintenable.**

---

## Architecture

L'application suit une architecture **MVC (Model-View-Controller)** avec une organisation claire :

```
Back/
├── src/
│   ├── index.js              # Point d'entrée de l'application
│   ├── config/
│   │   └── connectDB.js      # Connexion MongoDB avec logique de retry
│   ├── models/               # Schémas Mongoose (structure de données)
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
│   │   ├── auth.js           # Middleware d'authentification JWT
│   │   ├── requireAdmin.js   # Middleware d'autorisation admin
│   │   └── errorHandler.js   # Gestionnaire d'erreurs global
│   └── scripts/              # Scripts utilitaires
│       ├── fakeData.js       # Peuplement de la base de données
│       ├── updateProducts.js
│       └── updateMenus.js
├── .env                      # Variables d'environnement
├── .env.example              # Template d'environnement
├── package.json
└── Dockerfile
```

### Diagramme de Flux de Requête

```mermaid
flowchart TD
    A[Client/Frontend] -->|Requête HTTP| B[Serveur Express]
    B --> C[Middleware CORS]
    C --> D[Parser JSON Body]
    D --> E{Correspondance Route}
    E -->|/api/users| F[Routes Utilisateur]
    E -->|/api/products| G[Routes Produit]
    E -->|/api/menus| H[Routes Menu]
    E -->|/api/orders| I[Routes Commande]
    F --> J{Route Protégée ?}
    G --> J
    H --> J
    I --> J
    J -->|Oui| K[Middleware Auth]
    J -->|Non| L[Contrôleur]
    K -->|Token Valide| M{Admin Requis ?}
    K -->|Token Invalide| N[401 Non Autorisé]
    M -->|Oui| O[Middleware RequireAdmin]
    M -->|Non| L
    O -->|Est Admin| L
    O -->|Pas Admin| P[403 Interdit]
    L --> Q[Modèle Mongoose]
    Q --> R[(MongoDB Atlas)]
    R --> S[Réponse JSON]
    S --> A

    style A fill:#e3f2fd
    style R fill:#fff3e0
    style N fill:#ffcdd2
    style P fill:#ffcdd2
    style S fill:#c8e6c9
```

---

## Stack Technologique

| Technologie | Usage | Version |
|------------|-------|---------|
| **Node.js** | Environnement d'exécution JavaScript | 18.x |
| **Express** | Framework web minimaliste pour API REST | 4.18.2 |
| **MongoDB** | Base de données NoSQL orientée documents | Cloud |
| **Mongoose** | ODM (Object Data Modeling) pour MongoDB | 8.1.1 |
| **JWT (jsonwebtoken)** | Génération et vérification de tokens d'authentification | 9.0.2 |
| **bcryptjs** | Hachage sécurisé des mots de passe | 2.4.3 |
| **cors** | Gestion des requêtes cross-origin | 2.8.5 |
| **dotenv** | Chargement des variables d'environnement | 16.4.1 |
| **express-validator** | Validation des données entrantes | 7.0.1 |
| **nodemailer** | Envoi d'emails (notifications, confirmations) | 6.9.13 |
| **nodemon** | Redémarrage automatique sur modifications (développement) | 2.0.22 |

---

## Modèles de Base de Données

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
  isAdmin: Boolean (par défaut: false),
  resetPasswordToken: String,
  resetPasswordExpires: Date
}
```

**Index :** Unique sur `username`

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

**Catégories :** 5 types de produits pour l'organisation du menu

### 3. Menu (Menu)
Représente un menu composé de plusieurs produits.

```javascript
{
  title: String (requis),
  description: String,
  price: Number,
  inStock: Boolean (par défaut: true),
  imageSrc: String (URL de l'image, requis),
  type: String (toujours "Menu"),
  size: String (enum: ["medium", "large"], par défaut: "medium"),
  products: [ObjectId] (références aux produits inclus dans le menu)
}
```

**Relations :** Un-à-plusieurs avec Products (références embarquées)

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

**Timestamps :** Gérés automatiquement par Mongoose

### 5. OrderItem (Article de Commande)
Représente un article dans une commande (peut être un produit ou un menu).

```javascript
{
  itemRef: ObjectId (référence dynamique, requis),
  onModel: String (enum: ["Menu", "Product"] - indique le type d'article, requis),
  quantity: Number (minimum: 1, requis),
  selectedOptions: {
    size: String (enum: ["medium", "large"])
  }
}
```

**Note :** Le système utilise le pattern **polymorphique** avec `refPath` pour permettre à un OrderItem de référencer soit un Menu, soit un Product.

---

## Routes API

### Routes Utilisateur (`/api/users`)

| Méthode | Route | Auth | Admin | Description |
|---------|-------|------|-------|-------------|
| POST | `/register` | ❌ | ❌ | Inscription d'un nouvel utilisateur |
| POST | `/login` | ❌ | ❌ | Connexion (retourne un JWT) |
| GET | `/` | ✅ | ✅ | Liste tous les utilisateurs |
| GET | `/:id` | ✅ | ❌ | Récupère un utilisateur par ID (soi-même ou admin) |
| PUT | `/:id` | ✅ | ❌ | Met à jour un utilisateur (soi-même ou admin) |
| DELETE | `/:id` | ✅ | ✅ | Supprime un utilisateur |
| PUT | `/change-password/:userId` | ✅ | ❌ | Change le mot de passe |
| POST | `/forgot-password` | ❌ | ❌ | Demande un token de réinitialisation |
| POST | `/reset-password` | ❌ | ❌ | Réinitialise le mot de passe avec token |

### Routes Produit (`/api/products`)

| Méthode | Route | Auth | Admin | Description |
|---------|-------|------|-------|-------------|
| GET | `/` | ❌ | ❌ | Liste tous les produits (filtrable par type) |
| GET | `/:id` | ❌ | ❌ | Récupère un produit par ID |
| POST | `/add` | ✅ | ✅ | Crée un nouveau produit |
| PUT | `/modify/:id` | ✅ | ✅ | Met à jour un produit |
| DELETE | `/delete/:id` | ✅ | ✅ | Supprime un produit |

**Exemple de Filtrage par Requête :**
```bash
GET /api/products?type=Burgers
# Retourne seulement les produits où type === "Burgers"
```

### Routes Menu (`/api/menus`)

| Méthode | Route | Auth | Admin | Description |
|---------|-------|------|-------|-------------|
| GET | `/` | ❌ | ❌ | Liste tous les menus |
| GET | `/:id` | ❌ | ❌ | Récupère un menu par ID avec produits populés |
| POST | `/add` | ✅ | ✅ | Crée un nouveau menu |
| PUT | `/modify/:id` | ✅ | ✅ | Met à jour un menu |
| DELETE | `/delete/:id` | ✅ | ✅ | Supprime un menu |

### Routes Commande (`/api/orders`)

| Méthode | Route | Auth | Admin | Description |
|---------|-------|------|-------|-------------|
| GET | `/` | ✅ | ❌ | Récupère les commandes (toutes si admin, propres si utilisateur) |
| POST | `/add` | ✅ | ❌ | Soumet une nouvelle commande |

**Note :** Les routes marquées ✅ Auth nécessitent un token JWT valide dans le header `Authorization: Bearer <token>`.

---

## Authentification et Autorisation

L'application utilise **JWT (JSON Web Tokens)** pour sécuriser les routes sensibles.

### Processus d'Authentification

```mermaid
graph TD
    A[Inscription/Connexion Utilisateur] --> B{Inscription ou Connexion ?}
    B -->|Inscription| C[POST /api/users/register]
    B -->|Connexion| D[POST /api/users/login]
    C --> E[Valider les Données]
    E --> F[Hacher le Mot de Passe avec bcrypt]
    F --> G[Sauvegarder l'Utilisateur dans MongoDB]
    G --> H[Retourner Succès]
    D --> I[Trouver l'Utilisateur par Nom d'Utilisateur]
    I --> J{Utilisateur Existe ?}
    J -->|Non| K[Retourner 401 Identifiants Invalides]
    J -->|Oui| L[Comparer le Hash du Mot de Passe]
    L --> M{Mot de Passe Valide ?}
    M -->|Non| K
    M -->|Oui| N[Générer Token JWT]
    N --> O[Retourner Token + Données Utilisateur]
    O --> P[Frontend Stocke Token dans localStorage]

    style C fill:#bbdefb
    style D fill:#bbdefb
    style N fill:#c8e6c9
    style K fill:#ffcdd2
```

**1. Inscription/Connexion :**
- L'utilisateur s'inscrit (`/api/users/register`) ou se connecte (`/api/users/login`)
- Le mot de passe est haché avec **bcryptjs** (10 rounds de salt) avant stockage
- En cas de succès, le serveur génère un **JWT** contenant :
  ```javascript
  {
    userId: user._id,
    isAdmin: user.isAdmin
  }
  ```
- Le token est signé avec la clé secrète `JWT_SECRET` (définie dans `.env`)
- Le token expire dans 7 jours

**2. Utilisation du Token :**
- Le frontend stocke le token (localStorage)
- Pour chaque requête vers une route protégée, le token est envoyé dans le header :
  ```
  Authorization: Bearer <token>
  ```

**3. Vérification :**
- Le middleware [auth.js](src/middlewares/auth.js) intercepte les requêtes vers les routes protégées
- Vérifie la validité du token avec `jwt.verify()`
- Si valide, extrait les informations utilisateur et les ajoute à `req.user`
- Si invalide/absent, retourne une erreur 401 Unauthorized

### Exemple de Middleware

```javascript
// Exemple d'utilisation dans les routes
router.post('/add', auth, requireAdmin, productController.createProduct);
//                  ↑     ↑
//                  │     Vérification d'autorisation admin
//                  Middleware auth vérifie le token
```

**Niveaux d'Autorisation :**

- **Routes Publiques :** Liste produits/menus, inscription/connexion utilisateur
- **Routes Authentifiées :** Voir/mettre à jour son profil, soumettre des commandes
- **Routes Admin Uniquement :** Créer/mettre à jour/supprimer produits/menus, voir tous les utilisateurs/commandes

---

## Flux de Données

### Flux de Requête Standard

```mermaid
sequenceDiagram
    participant C as Client
    participant E as Express
    participant M as Middleware
    participant R as Router
    participant Ctrl as Contrôleur
    participant Model as Modèle Mongoose
    participant DB as MongoDB

    C->>E: Requête HTTP
    E->>E: Middleware CORS
    E->>E: Parser JSON Body
    E->>R: Correspondance Route
    R->>M: Middleware Auth (si protégée)
    M->>M: Vérifier Token JWT
    M->>M: Attacher req.user
    M->>Ctrl: Passer Requête
    Ctrl->>Ctrl: Logique Métier
    Ctrl->>Model: Requête/Modification Données
    Model->>DB: Exécuter Requête
    DB-->>Model: Retourner Données
    Model-->>Ctrl: Retourner Résultats
    Ctrl-->>E: Réponse JSON
    E-->>C: Réponse HTTP
```

### Exemple Complet : Soumission de Commande

**1. Frontend :** L'utilisateur clique sur "Passer Commande"
```javascript
// Front/src/pages/CartAndOrderSummary.jsx
const response = await fetch('https://burger-house-back.onrender.com/api/orders/add', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ items, totalPrice })
});
```

**2. Backend :** Réception de la requête
```javascript
// Back/src/routes/orderRoutes.js
router.post('/add', auth, orderController.submitBackOrder);
```

**3. Contrôleur :** Traitement de la commande
```javascript
// Back/src/controllers/orderController.js
const newOrder = new Order({
  items,
  totalPrice,
  customer: req.user.id,
  status: "pending"
});
await newOrder.save(); // Sauvegarder dans MongoDB
```

**4. MongoDB :** Stockage de la commande dans la collection `orders`

**5. Réponse :** Le backend retourne la commande créée au frontend

---

## Installation

### Prérequis
- **Node.js** (v18 ou supérieur)
- **npm** ou **yarn**
- Compte **MongoDB Atlas** (ou instance MongoDB locale)

### Étapes

**1. Cloner le repository**
```bash
cd Back
```

**2. Installer les dépendances**
```bash
npm install
```

**3. Configurer les variables d'environnement**

Créer un fichier `.env` à la racine du dossier `Back/` :
```env
PORT=2233
MONGO_URI=mongodb+srv://<utilisateur>:<motdepasse>@cluster.mongodb.net/burgerDB?retryWrites=true&w=majority
JWT_SECRET=votre_cle_secrete_tres_longue_et_complexe
ALLOWED_ORIGINS=https://votre-frontend.vercel.app,http://localhost:5173
NODE_ENV=development
```

- `PORT` : Port sur lequel le serveur écoute
- `MONGO_URI` : Chaîne de connexion MongoDB Atlas
- `JWT_SECRET` : Clé secrète pour signer les JWT (doit être sécurisée)
- `ALLOWED_ORIGINS` : Liste séparée par virgules des origines CORS autorisées
- `NODE_ENV` : Mode environnement (development/production)

**4. Démarrer le serveur**

**Mode développement** (avec rechargement automatique) :
```bash
npm run dev
```

**Mode production :**
```bash
npm start
```

**5. Vérifier le fonctionnement**

Ouvrir un navigateur ou Postman et tester :
```
http://localhost:2233/
```

Réponse attendue : `"Welcome to the Burger Shop API!"`

**6. Tester les endpoints API**

```bash
# Récupérer tous les produits
curl http://localhost:2233/api/products

# Inscription utilisateur
curl -X POST http://localhost:2233/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123","name":"Test","email":"test@example.com"}'

# Connexion
curl -X POST http://localhost:2233/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}'
```

---

## Déploiement

L'application est déployée sur **Render** (plateforme cloud).

### Configuration Render

Render détecte automatiquement la configuration du projet depuis votre dépôt :
- Détecte le Dockerfile pour le déploiement conteneurisé
- Lit les variables d'environnement depuis le tableau de bord Render
- Déploie automatiquement lors d'un push git vers la branche main

**Configuration Clé :**
- **Commande de Build :** Build Docker (automatique)
- **Commande de Démarrage :** `npm run start` (depuis Dockerfile)
- **Port :** 2233 (interne), 443 (HTTPS externe)
- **Vérification de Santé :** endpoint `/healthz`

### Déployer sur Render

**1. Créer un Compte Render**
Visitez https://render.com et inscrivez-vous

**2. Connecter le Dépôt GitHub**
- Cliquez sur "New +" → "Web Service"
- Connectez votre compte GitHub
- Sélectionnez le dépôt backend
- Render détecte automatiquement le Dockerfile

**3. Configurer le Service**
```
Nom : burger-house-back
Région : Choisir la plus proche des utilisateurs (ex : Frankfurt, Oregon)
Branche : main
Répertoire Racine : Back/
```

**4. Définir les Variables d'Environnement**
Dans le tableau de bord Render, ajoutez :
```
MONGO_URI = mongodb+srv://username:password@cluster.mongodb.net/burgerDB
JWT_SECRET = votre_cle_secrete_ultra_securisee
ALLOWED_ORIGINS = https://votre-frontend.vercel.app,http://localhost:5173
NODE_ENV = production
```

**5. Déployer**
Cliquez sur "Create Web Service" - Render va :
- Construire l'image Docker
- Déployer le conteneur
- Assigner une URL
- Activer HTTPS automatiquement

**6. Surveiller le Déploiement**
- Voir les logs de build en temps réel
- Vérifier l'état du déploiement
- Accéder aux logs depuis le tableau de bord

**7. Vérifier la Santé**
```bash
curl https://burger-house-back.onrender.com/healthz
```

### URL de Production
Une fois déployé, l'API est accessible à :
```
https://burger-house-back.onrender.com
```

### Déploiements Automatiques

Render redéploie automatiquement lorsque vous poussez vers GitHub :
```bash
git add .
git commit -m "Mise à jour du backend"
git push origin main
# Render détecte et déploie automatiquement
```

### Déploiement Docker

L'application inclut un Dockerfile multi-étapes pour la conteneurisation :

```dockerfile
# Étape 1 : Build
FROM node:23.9.0-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Étape 2 : Production
FROM node:23.9.0-slim
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY . .
EXPOSE 8080
CMD ["npm", "run", "start"]
```

---

## Notes Importantes

### Bonnes Pratiques de Sécurité
- **Ne jamais commiter le fichier `.env`** (utiliser `.gitignore`)
- **Toujours hacher les mots de passe** avec bcrypt (jamais en clair)
- **Configuration CORS** restreint l'accès API aux origines autorisées
- **Validation d'entrée** avec express-validator prévient les attaques par injection
- **Secrets JWT** doivent être longs, aléatoires et sécurisés
- **Séparation d'environnement** utilise différents identifiants pour dev/prod

### Peuplement de la Base de Données

Utilisez le script de peuplement fourni pour remplir la base de données avec des données de test :

```bash
node src/scripts/fakeData.js
```

Cela crée :
- 3 utilisateurs (1 admin, 2 clients)
- 15 produits (3 par catégorie)
- 5 menus avec des combinaisons de produits aléatoires

**Note :** Le peuplement utilise une connexion MongoDB locale. Mettre à jour la chaîne de connexion dans le script pour la base de données cloud.

### Gestion des Erreurs

Le middleware de gestion d'erreurs global attrape toutes les exceptions :

```javascript
// src/middlewares/errorHandler.js
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});
```

### Monitoring et Débogage

**Vérifier le statut du serveur :**
```bash
# Local
npm run dev
# Ouvrir : http://localhost:2233
# Devrait afficher : "Welcome to the Burger Shop API!"

# Production
curl https://burger-house-back.fly.dev
```

**Voir les logs :**
```bash
# Production (Fly.io)
flyctl logs

# Développement
# Les erreurs s'affichent directement dans le terminal
```

### Principes Architecturaux Clés

1. **Pattern MVC :** Séparation claire des responsabilités
2. **Architecture Stateless :** Pas de sessions, JWT permet le scaling horizontal
3. **Design RESTful :** Méthodes HTTP standard pour les opérations CRUD
4. **Résilience Base de Données :** Logique de retry de connexion prévient les échecs transitoires
5. **Références Polymorphiques :** OrderItems peut référencer Products ou Menus
6. **Configuration Basée sur l'Environnement :** Supporte plusieurs environnements de déploiement

---

## Support

Pour toute question ou problème :
- Vérifier les logs du serveur avec `npm run dev`
- Consulter la documentation MongoDB : https://docs.mongodb.com
- Consulter la documentation Express : https://expressjs.com
- Consulter la documentation Mongoose : https://mongoosejs.com

---

**Bon développement !**
