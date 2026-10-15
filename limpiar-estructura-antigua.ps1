# Borra los archivos de la estructura antigua (ya copiados a sus nuevas carpetas).
# Ejecutar desde C:\Proyecto\Front-End:  powershell -ExecutionPolicy Bypass -File .\limpiar-estructura-antigua.ps1
$archivos = @(
  'src\App.css',
  'src\assets\inicio\banner.png',
  'src\assets\inicio\consejo-1.jpeg',
  'src\assets\inicio\consejo-2.jpg',
  'src\assets\inicio\consejo-3.jpg',
  'src\assets\inicio\flecha-abajo.png',
  'src\assets\inicio\logo.png',
  'src\assets\pata.png',
  'src\assets\perroFotoInicioSecion.png',
  'src\components\auth\PasswordMoldal.jsx',
  'src\components\mascota\Mascotas.jsx',
  'src\assets\auth.css',
  'src\assets\foro\foro.css',
  'src\assets\home.css',
  'src\assets\perfil.css'
)
foreach ($a in $archivos) { if (Test-Path $a) { Remove-Item $a -Force; Write-Host "Eliminado $a" } }
foreach ($d in @("src\assets\inicio","src\assets\foro","src\components\mascota")) { if ((Test-Path $d) -and -not (Get-ChildItem $d)) { Remove-Item $d; Write-Host "Carpeta vacia eliminada $d" } }
