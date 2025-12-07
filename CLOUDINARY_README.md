# Configuration Cloudinary

## Où trouver vos clés API

### 1. Dans votre dashboard Cloudinary
1. Connectez-vous sur [cloudinary.com](https://cloudinary.com)
2. Allez dans "Dashboard" (en haut à gauche)
3. Vous verrez vos clés API dans la section "Account Details"

**Vos clés correspondent à :**
- `CLOUDINARY_CLOUD_NAME` = **Cloud name** (ex: `dxyz12345`)
- `CLOUDINARY_API_KEY` = **API Key** (ex: `123456789012345`)
- `CLOUDINARY_API_SECRET` = **API Secret** (ex: `abc123def456`)

### 2. Variables d'environnement à définir

#### Frontend (.env.local)
```env
# Utilisez VOTRE cloud name (le même que CLOUDINARY_CLOUD_NAME)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dxyz12345

# À créer dans Cloudinary (voir étape 3)
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=masseuse_services
```

#### Backend (.env)
```env
# Vos vraies clés API
CLOUDINARY_CLOUD_NAME=dxyz12345
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abc123def456
```

## Étapes de configuration

### 3. Créer un Upload Preset (IMPORTANT)
1. Dans votre dashboard Cloudinary, cliquez sur **"Settings"** (engrenage)
2. Cliquez sur **"Upload"** dans le menu latéral
3. Cliquez sur **"Add upload preset"**
4. **Nom du preset** : `masseuse_services`
5. **Mode** : `Unsigned` (important pour les uploads côté client)
6. **Format** : `Auto`
7. **Qualité** : `Auto`
8. **Allowed formats** : `jpg,png,gif,webp`
9. **Max file size** : `5000000` (5MB)
10. Cliquez sur **"Save"**

### 4. Tester la configuration
Une fois configuré, vous pouvez tester l'upload d'images dans le formulaire de gestion des services.

## Résumé des valeurs

| Variable | Valeur | Où la trouver |
|----------|--------|---------------|
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | `dxyz12345` | Dashboard Cloudinary → Account Details → Cloud name |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | `masseuse_services` | Nom du preset que vous créez |
| `CLOUDINARY_API_KEY` | `123456789012345` | Dashboard Cloudinary → Account Details → API Key |
| `CLOUDINARY_API_SECRET` | `abc123def456` | Dashboard Cloudinary → Account Details → API Secret |

**Important** : Le `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` n'existe pas par défaut, vous devez le créer vous-même dans Cloudinary !