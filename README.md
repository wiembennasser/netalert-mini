# NetAlert Mini

NetAlert Mini est une application lÃ©gÃ¨re de supervision permettant de vÃ©rifier l'Ã©tat de plusieurs services depuis un tableau de bord web.

## FonctionnalitÃ©s

- Tableau de bord web en franÃ§ais.
- VÃ©rification de l'Ã©tat des services.
- API de santÃ© : `/health`.
- API de supervision : `/api/status`.
- Tests automatisÃ©s avec Node.js.
- Conteneurisation avec Docker.
- Orchestration avec Docker Compose.
- IntÃ©gration continue avec GitHub Actions.
- Fichiers de configuration pour Kubernetes et Terraform.

## PrÃ©requis

- Node.js 20 ou supÃ©rieur.
- npm.
- Docker Desktop et Docker Compose.

## Lancement en local

Ã€ la racine du projet, exÃ©cuter :

```powershell
npm test
npm start
```

Ouvrir ensuite http://localhost:3000.

## VÃ©rifier l'application

VÃ©rifier l'Ã©tat de santÃ© :

```powershell
Invoke-RestMethod http://localhost:3000/health
```

VÃ©rifier les services supervisÃ©s :

```powershell
Invoke-RestMethod http://localhost:3000/api/status | ConvertTo-Json -Depth 5
```

## Lancement avec Docker Compose

Construire l'image :

```powershell
docker compose build
```

DÃ©marrer le conteneur :

```powershell
docker compose up -d
```

VÃ©rifier son Ã©tat :

```powershell
docker compose ps
```

Consulter les logs :

```powershell
docker compose logs --tail 50 netalert
```

ArrÃªter l'application :

```powershell
docker compose down
```

## Tests

ExÃ©cuter les tests :

```powershell
npm test
```

VÃ©rifier la syntaxe du serveur :

```powershell
node --check server.js
```

## IntÃ©gration continue

Le workflow `.github/workflows/ci.yml` vÃ©rifie la syntaxe du serveur et exÃ©cute les tests lors des pushs et des pull requests vers la branche `main`.

## Structure du projet

- `.github/workflows/ci.yml` : pipeline CI.
- `public/` : interface web.
- `tests/` : tests automatisÃ©s.
- `k8s/` : configurations Kubernetes.
- `terraform/` : configurations Terraform.
- `Dockerfile` : construction de l'image.
- `docker-compose.yml` : lancement de l'application.
- `server.js` : serveur Node.js.

## Remarque

La supervision des services externes dÃ©pend de la connexion rÃ©seau et des dÃ©lais de rÃ©ponse. Un service indiquÃ© DOWN peut Ãªtre inaccessible ou avoir dÃ©passÃ© le dÃ©lai d'attente sans Ãªtre nÃ©cessairement hors service.