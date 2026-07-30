param(
    [string]$Origen,
    [string]$Destino,
    [string]$Catalogo,
    [string]$Estado
)

$ErrorActionPreference = "Stop"

try {
    New-Item -ItemType Directory -Path $Destino -Force | Out-Null
    $archivos = Get-ChildItem -LiteralPath $Origen -File -Recurse
    $indice = 0
    $catalogoDocumentos = foreach ($archivo in $archivos) {
        $indice++
        $extension = [System.IO.Path]::GetExtension($archivo.Name).ToLowerInvariant()
        $nombreInterno = "recurso-{0:D4}{1}" -f $indice, $extension
        $destinoArchivo = Join-Path $Destino $nombreInterno
        if (-not (Test-Path -LiteralPath $destinoArchivo)) {
            [System.IO.File]::Copy("\\?\$($archivo.FullName)", "\\?\$destinoArchivo", $true)
        }
        [PSCustomObject]@{
            nombre = $archivo.Name
            ruta = $nombreInterno
        }
    }

    $json = $catalogoDocumentos | ConvertTo-Json -Depth 3 -Compress
    [System.IO.File]::WriteAllText($Catalogo, $json, (New-Object System.Text.UTF8Encoding($false)))
    [System.IO.File]::WriteAllText($Estado, "COMPLETO")
}
catch {
    [System.IO.File]::WriteAllText($Estado, $_.Exception.Message)
    exit 1
}
