# Script para corrigir aspas misturadas
Write-Host "Corrigindo aspas misturadas em imports..."

$files = Get-ChildItem -Path src -Recurse -Include *.tsx,*.ts -Exclude *.d.ts
$fixedCount = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Corrigir: from "path' -> from "path"
    $content = $content -replace 'from "([^"]+)''', 'from "$1"'
    
    # Corrigir: from 'path" -> from 'path'
    $content = $content -replace "from '([^']+)""", "from '$1'"
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Fixed: $($file.Name)"
        $fixedCount++
    }
}

Write-Host "`nConcluido! $fixedCount arquivos corrigidos."
