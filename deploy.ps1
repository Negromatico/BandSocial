# Script de Deploy para Netlify
# BandSocial - Deployment Script

Write-Host "🚀 Iniciando proceso de deploy a Netlify..." -ForegroundColor Cyan
Write-Host ""

# Paso 1: Verificar que estamos en el directorio correcto
Write-Host "📁 Verificando directorio..." -ForegroundColor Yellow
if (!(Test-Path "package.json")) {
    Write-Host "❌ Error: No se encontró package.json" -ForegroundColor Red
    Write-Host "   Asegúrate de estar en la carpeta del proyecto" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Directorio correcto" -ForegroundColor Green
Write-Host ""

# Paso 2: Instalar dependencias
Write-Host "📦 Instalando dependencias..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error instalando dependencias" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencias instaladas" -ForegroundColor Green
Write-Host ""

# Paso 3: Build del proyecto
Write-Host "🔨 Creando build de producción..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error en el build" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build completado" -ForegroundColor Green
Write-Host ""

# Paso 4: Verificar que existe la carpeta dist
if (!(Test-Path "dist")) {
    Write-Host "❌ Error: No se generó la carpeta dist" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Carpeta dist generada correctamente" -ForegroundColor Green
Write-Host ""

# Paso 5: Información para el usuario
Write-Host "🎉 Build completado exitosamente!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos pasos:" -ForegroundColor Cyan
Write-Host "   1. Ejecuta: netlify login" -ForegroundColor White
Write-Host "   2. Ejecuta: netlify deploy (para preview)" -ForegroundColor White
Write-Host "   3. Ejecuta: netlify deploy --prod (para producción)" -ForegroundColor White
Write-Host ""
Write-Host "💡 Tip: Puedes hacer deploy directo con:" -ForegroundColor Yellow
Write-Host "   netlify deploy --prod --dir=dist" -ForegroundColor White
Write-Host ""
