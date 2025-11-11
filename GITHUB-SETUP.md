# 📦 GUÍA PARA SUBIR BANDSOCIAL A GITHUB

## ✅ PASO 1: CREAR REPOSITORIO EN GITHUB

1. **Ve a GitHub**: [https://github.com](https://github.com)
2. **Inicia sesión** con tu cuenta
3. **Click en el botón "+"** en la esquina superior derecha
4. **Selecciona "New repository"**

### Configuración del Repositorio:

```
Repository name: BandSocial
Description: 🎸 Red Social Musical - Plataforma integral para músicos y bandas en Colombia
Visibility: ✓ Public (o Private si prefieres)

❌ NO marques:
   - Add a README file
   - Add .gitignore
   - Choose a license
   
(Ya tenemos estos archivos)
```

5. **Click en "Create repository"**

---

## ✅ PASO 2: CONECTAR REPOSITORIO LOCAL CON GITHUB

Después de crear el repositorio, GitHub te mostrará instrucciones. Usa estas:

### Opción A: Si ya inicializaste Git (YA HECHO ✅)

```bash
# Agregar el remote de GitHub
git remote add origin https://github.com/TU_USUARIO/BandSocial.git

# Renombrar la rama a main (opcional, si prefieres main en vez de master)
git branch -M main

# Subir el código
git push -u origin main
```

### Opción B: Si usas SSH (recomendado para seguridad)

```bash
# Agregar el remote con SSH
git remote add origin git@github.com:TU_USUARIO/BandSocial.git

# Renombrar la rama a main
git branch -M main

# Subir el código
git push -u origin main
```

---

## ✅ PASO 3: EJECUTAR LOS COMANDOS

Abre tu terminal en la carpeta del proyecto y ejecuta:

```bash
# 1. Agregar el remote (reemplaza TU_USUARIO con tu usuario de GitHub)
git remote add origin https://github.com/TU_USUARIO/BandSocial.git

# 2. Verificar que se agregó correctamente
git remote -v

# 3. Renombrar rama a main (opcional)
git branch -M main

# 4. Subir el código a GitHub
git push -u origin main
```

---

## ✅ PASO 4: VERIFICAR QUE SE SUBIÓ CORRECTAMENTE

1. **Ve a tu repositorio** en GitHub: `https://github.com/TU_USUARIO/BandSocial`
2. **Deberías ver**:
   - ✅ README.md con la documentación completa
   - ✅ 94 archivos
   - ✅ Carpetas: src/, public/, cypress/, etc.
   - ✅ Archivos de configuración: package.json, vite.config.js, etc.

---

## 📋 COMANDOS ÚTILES DE GIT

### Ver el estado de tus archivos
```bash
git status
```

### Ver el historial de commits
```bash
git log --oneline
```

### Hacer cambios futuros
```bash
# 1. Hacer cambios en el código
# 2. Agregar los cambios
git add .

# 3. Hacer commit
git commit -m "Descripción de los cambios"

# 4. Subir a GitHub
git push
```

### Crear una nueva rama
```bash
# Crear y cambiar a nueva rama
git checkout -b nombre-de-la-rama

# Subir la nueva rama a GitHub
git push -u origin nombre-de-la-rama
```

### Actualizar desde GitHub
```bash
# Traer cambios del repositorio remoto
git pull
```

---

## 🔒 SEGURIDAD: VARIABLES DE ENTORNO

### ⚠️ IMPORTANTE: Nunca subas el archivo .env

El archivo `.env` con tus credenciales de Firebase **NO se subirá** a GitHub porque está en `.gitignore`.

### Para colaboradores:

1. **Comparte el archivo `.env.example`** (ya está en el repo)
2. **Los colaboradores deben**:
   ```bash
   # Copiar el ejemplo
   cp .env.example .env
   
   # Editar .env con las credenciales reales
   ```

---

## 🌟 CONFIGURAR GITHUB PAGES (OPCIONAL)

Si quieres usar GitHub Pages además de Netlify:

1. Ve a **Settings** en tu repositorio
2. Click en **Pages** en el menú lateral
3. En **Source**, selecciona:
   - Branch: `main`
   - Folder: `/` (root)
4. Click en **Save**

**Nota**: Para React con Vite, es mejor usar Netlify (ya configurado).

---

## 🚀 BADGES PARA EL README

Puedes agregar badges al README.md para que se vea más profesional:

```markdown
![GitHub repo size](https://img.shields.io/github/repo-size/TU_USUARIO/BandSocial)
![GitHub stars](https://img.shields.io/github/stars/TU_USUARIO/BandSocial?style=social)
![GitHub forks](https://img.shields.io/github/forks/TU_USUARIO/BandSocial?style=social)
![GitHub issues](https://img.shields.io/github/issues/TU_USUARIO/BandSocial)
![GitHub pull requests](https://img.shields.io/github/issues-pr/TU_USUARIO/BandSocial)
![GitHub last commit](https://img.shields.io/github/last-commit/TU_USUARIO/BandSocial)
```

---

## 🤝 COLABORACIÓN

### Invitar colaboradores:

1. Ve a **Settings** → **Collaborators**
2. Click en **Add people**
3. Ingresa el username de GitHub del colaborador
4. Selecciona el nivel de acceso (Write, Admin, etc.)

### Flujo de trabajo recomendado:

```bash
# 1. Crear rama para nueva funcionalidad
git checkout -b feature/nueva-funcionalidad

# 2. Hacer cambios y commits
git add .
git commit -m "Add: nueva funcionalidad"

# 3. Subir rama
git push -u origin feature/nueva-funcionalidad

# 4. Crear Pull Request en GitHub
# 5. Revisar y hacer merge a main
```

---

## 📊 INTEGRACIÓN CON NETLIFY

Netlify ya está configurado para hacer deploy automático desde GitHub:

1. **En Netlify Dashboard**:
   - Site settings → Build & deploy
   - Continuous Deployment → GitHub

2. **Cada vez que hagas push a `main`**:
   - Netlify detectará los cambios
   - Hará build automático
   - Desplegará la nueva versión

---

## 🎯 PRÓXIMOS PASOS

1. ✅ **Subir el código a GitHub** (siguiendo esta guía)
2. ✅ **Configurar GitHub Actions** (CI/CD) - opcional
3. ✅ **Agregar badges** al README
4. ✅ **Invitar colaboradores** si es necesario
5. ✅ **Crear issues** para tareas pendientes
6. ✅ **Configurar Projects** para gestión de tareas

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### Error: "remote origin already exists"
```bash
# Eliminar el remote existente
git remote remove origin

# Agregar el nuevo
git remote add origin https://github.com/TU_USUARIO/BandSocial.git
```

### Error: "failed to push some refs"
```bash
# Forzar el push (solo si estás seguro)
git push -u origin main --force
```

### Error: "Authentication failed"
```bash
# Configurar credenciales
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"

# Si usas HTTPS, GitHub pedirá tu token personal
# Crea uno en: Settings → Developer settings → Personal access tokens
```

---

## 📞 AYUDA

Si tienes problemas:
- **GitHub Docs**: [https://docs.github.com](https://docs.github.com)
- **Git Docs**: [https://git-scm.com/doc](https://git-scm.com/doc)

---

<div align="center">

**¡Listo para compartir tu código con el mundo! 🚀**

</div>
