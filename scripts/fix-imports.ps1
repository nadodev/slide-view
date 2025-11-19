# Script para padronizar imports para path aliases
# Autor: Refatoração Fase 1
# Data: 2025-11-19

Write-Host "🔧 Iniciando padronização de imports..." -ForegroundColor Cyan
Write-Host ""

$totalFixed = 0
$files = Get-ChildItem -Path src -Recurse -Include *.tsx,*.ts -Exclude *.d.ts

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Padrão 1: Imports relativos de hooks
    $content = $content -replace 'from [''"]\.\.\/hooks\/', 'from "@/hooks/'
    $content = $content -replace 'from [''"]\.\.\/\.\.\/hooks\/', 'from "@/hooks/'
    $content = $content -replace 'from [''"]\.\.\/\.\.\/\.\.\/hooks\/', 'from "@/hooks/'
    
    # Padrão 2: Imports relativos de utils
    $content = $content -replace 'from [''"]\.\.\/utils\/', 'from "@/utils/'
    $content = $content -replace 'from [''"]\.\.\/\.\.\/utils\/', 'from "@/utils/'
    $content = $content -replace 'from [''"]\.\.\/\.\.\/\.\.\/utils\/', 'from "@/utils/'
    
    # Padrão 3: Imports relativos de types (./types ou ../types)
    $content = $content -replace 'from ["'']\./types[''"]', 'from "@/types"'
    $content = $content -replace 'from [''"]\.\.\/types[''"]', 'from "@/types"'
    $content = $content -replace 'from [''"]\.\.\/\.\.\/types[''"]', 'from "@/types"'
    
    # Padrão 4: Imports relativos de components
    $content = $content -replace 'from [''"]\.\.\/components\/', 'from "@/shared/components/'
    $content = $content -replace 'from [''"]\.\.\/\.\.\/components\/', 'from "@/shared/components/'
    
    # Padrão 5: Imports relativos de services
    $content = $content -replace 'from [''"]\.\.\/services\/', 'from "@/services/'
    $content = $content -replace 'from [''"]\.\.\/\.\.\/services\/', 'from "@/services/'
    
    # Padrão 6: Imports relativos de store
    $content = $content -replace 'from [''"]\.\.\/store\/', 'from "@/store/'
    $content = $content -replace 'from [''"]\.\.\/\.\.\/store\/', 'from "@/store/'
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "✓ $($file.FullName.Replace((Get-Location).Path + '\', ''))" -ForegroundColor Green
        $totalFixed++
    }
}

Write-Host ""
Write-Host "✅ Concluído! $totalFixed arquivos atualizados." -ForegroundColor Cyan
Write-Host ""
