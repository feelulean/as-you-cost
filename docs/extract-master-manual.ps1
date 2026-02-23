$srcFile = "c:\Users\egrou\as-you-cost\docs\사용자 Manual_기준정보관리.pptx"
$destFile = "c:\Users\egrou\as-you-cost\docs\master-manual.pptx"
$outFile = "c:\Users\egrou\as-you-cost\docs\master-manual.txt"

Copy-Item $srcFile $destFile -Force

Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead($destFile)
$slides = $zip.Entries | Where-Object { $_.FullName -match "^ppt/slides/slide\d+\.xml$" } | Sort-Object { [int]($_.FullName -replace '[^\d]','') }

$result = @()
$slideNum = 0
foreach ($entry in $slides) {
    $slideNum++
    $reader = New-Object System.IO.StreamReader($entry.Open())
    $content = $reader.ReadToEnd()
    $reader.Close()

    $xml = [xml]$content
    $nsMgr = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
    $nsMgr.AddNamespace("a", "http://schemas.openxmlformats.org/drawingml/2006/main")

    $texts = $xml.SelectNodes("//a:t", $nsMgr)
    $slideText = @()
    foreach ($t in $texts) {
        if ($t.InnerText.Trim()) {
            $slideText += $t.InnerText.Trim()
        }
    }

    if ($slideText.Count -gt 0) {
        $result += "=== Slide $slideNum ==="
        $result += ($slideText -join "`n")
        $result += ""
    }
}

$zip.Dispose()
$result | Out-File -Encoding utf8 $outFile
Write-Output "Extracted $slideNum slides to $outFile"
