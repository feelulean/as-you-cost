[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead('c:\Users\egrou\as-you-cost\docs\estimate-manual.pptx')
$slideEntries = $zip.Entries | Where-Object { $_.FullName -match 'ppt/slides/slide\d+\.xml' } | Sort-Object { [int]($_.FullName -replace '\D','') }
$result = @()
foreach ($entry in $slideEntries) {
    $stream = $entry.Open()
    $reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::UTF8)
    $xml = [xml]$reader.ReadToEnd()
    $reader.Close()
    $stream.Close()
    $ns = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
    $ns.AddNamespace('a','http://schemas.openxmlformats.org/drawingml/2006/main')
    $ns.AddNamespace('p','http://schemas.openxmlformats.org/presentationml/2006/main')
    $slideNum = $entry.FullName -replace '\D',''
    $line = "=== Slide $slideNum ==="
    $result += $line
    $paragraphs = $xml.SelectNodes('//a:p', $ns)
    foreach ($p in $paragraphs) {
        $pText = ''
        $runs = $p.SelectNodes('.//a:t', $ns)
        foreach ($r in $runs) {
            $pText += $r.InnerText
        }
        if ($pText.Trim() -ne '') {
            $result += $pText
        }
    }
    $result += ''
}
$zip.Dispose()
$result | Out-File -FilePath 'c:\Users\egrou\as-you-cost\docs\estimate-cost-manual.txt' -Encoding UTF8
Write-Host "Extracted to estimate-cost-manual.txt"
