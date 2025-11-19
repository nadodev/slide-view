# Script to fix all imports in the codebase
$files = Get-ChildItem -Path src -Recurse -Include *.tsx,*.ts -Exclude *.d.ts

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Fix component imports
    $content = $content -replace 'from [''"]\.\.\/components\/', 'from "@/shared/components/'
    $content = $content -replace 'from [''"]\.\.\/\.\.\/components\/', 'from "@/shared/components/'
    $content = $content -replace 'from [''"]\.\.\/\.\.\/\.\.\/components\/', 'from "@/shared/components/'
    
    # Fix hooks imports
    $content = $content -replace 'from [''"]\.\.\/hooks\/', 'from "@/hooks/'
    $content = $content -replace 'from [''"]\.\.\/\.\.\/hooks\/', 'from "@/hooks/'
    $content = $content -replace 'from [''"]\.\.\/\.\.\/\.\.\/hooks\/', 'from "@/hooks/'
    
    # Fix utils imports
    $content = $content -replace 'from [''"]\.\.\/utils\/', 'from "@/utils/'
    $content = $content -replace 'from [''"]\.\.\/\.\.\/utils\/', 'from "@/utils/'
    $content = $content -replace 'from [''"]\.\.\/\.\.\/\.\.\/utils\/', 'from "@/utils/'
    
    # Fix UI components
    $content = $content -replace 'from [''"]\.\/ui\/', 'from "@/shared/components/ui/'
    $content = $content -replace 'from [''"]\.\.\/ui\/', 'from "@/shared/components/ui/'
    $content = $content -replace 'from [''"]\.\.\/\.\.\/ui\/', 'from "@/shared/components/ui/'
    
    # Fix specific component imports
    $content = $content -replace 'from [''"]\.\.\/SlidesWithThumbs[''"]', 'from "@/features/slides/SlidesWithThumbs"'
    $content = $content -replace 'from [''"]\.\.\/SlideList[''"]', 'from "@/features/slides/SlideList"'
    $content = $content -replace 'from [''"]\.\.\/UploadArea[''"]', 'from "@/features/slides/UploadArea"'
    $content = $content -replace 'from [''"]\.\.\/Navigation[''"]', 'from "@/shared/components/layout/Navigation"'
    $content = $content -replace 'from [''"]\.\.\/ScrollTopButton[''"]', 'from "@/shared/components/layout/ScrollTopButton"'
    $content = $content -replace 'from [''"]\.\.\/EditPanel[''"]', 'from "@/features/editor/EditPanel"'
    $content = $content -replace 'from [''"]\.\.\/Presentation[''"]', 'from "@/features/presentation/Presentation"'
    $content = $content -replace 'from [''"]\.\.\/PresenterView[''"]', 'from "@/features/presentation/PresenterView"'
    $content = $content -replace 'from [''"]\.\.\/RemoteControl[''"]', 'from "@/features/remote-control/RemoteControl"'
    $content = $content -replace 'from [''"]\.\.\/QRCodeDisplay[''"]', 'from "@/features/remote-control/QRCodeDisplay"'
    $content = $content -replace 'from [''"]\.\.\/RemoteControlModal[''"]', 'from "@/features/remote-control/RemoteControlModal"'
    
    # Fix slides folder imports
    $content = $content -replace 'from [''"]\.\.\/slides\/', 'from "@/features/slides/'
    $content = $content -replace 'from [''"]\.\.\/\.\.\/slides\/', 'from "@/features/slides/'
    
    # Fix presentation folder imports  
    $content = $content -replace 'from [''"]\.\/presentation\/', 'from "./'
    
    # Only write if content changed
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Fixed: $($file.FullName)"
    }
}

Write-Host "`nDone! All imports have been updated."
