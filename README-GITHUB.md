# STESIN · repositorio de archivos

Este repositorio contiene el portal STESIN y su material académico. Los documentos y recursos binarios se controlan con Git LFS.

## Antes de subir a GitHub

1. Crea un repositorio vacío en GitHub, por ejemplo `stesin-archivos`.
2. Copia la dirección HTTPS del repositorio.
3. En la carpeta de este proyecto ejecuta:

```powershell
git remote add origin URL_DEL_REPOSITORIO
git add .
git commit -m "Agregar portal y biblioteca STESIN"
git branch -M main
git push -u origin main
```

No publiques este repositorio con GitHub Pages: Git LFS almacena los documentos grandes, pero Pages no puede servirlos. Para la página pública usa la carpeta `STESIN-GitHub-Pages` en un repositorio distinto.
