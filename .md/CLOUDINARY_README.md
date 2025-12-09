# Configuration Cloudinary

## Étapes de configuration

### 1. Créer un compte Cloudinary

1. Allez sur [cloudinary.com](https://cloudinary.com)
2. Créez un compte gratuit
3. Notez vos clés API dans le dashboard

### 2. Configurer les variables d'environnement

#### Frontend (.env.local)

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=votre_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=masseuse_services
```

#### Backend (.env)

```env
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
```

### 3. Créer un Upload Preset

1. Dans votre dashboard Cloudinary, allez dans "Settings" > "Upload"
2. Cliquez sur "Add upload preset"
3. Nommez-le `masseuse_services`
4. Configurez :
   - Mode : `Unsigned` (pour les uploads côté client)
   - Format : `Auto`
   - Qualité : `Auto`
   - Allowed formats : `jpg,png,gif,webp`
   - Max file size : `5000000` (5MB)

### 4. Utilisation

- Les images sont automatiquement optimisées et redimensionnées
- Support du format WebP automatique
- URLs générées automatiquement avec les bonnes dimensions

## Fonctionnalités implémentées

- ✅ Upload d'images dans le formulaire de gestion des services
- ✅ Affichage optimisé des images dans les cartes de service
- ✅ Affichage optimisé dans les pages de détail
- ✅ Fallback vers les URLs originales si Cloudinary n'est pas configuré
