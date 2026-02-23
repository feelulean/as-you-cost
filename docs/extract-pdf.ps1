param([string]$pdfPath, [string]$outPath)

# Simple PDF text extraction using .NET
# Note: This is a basic approach that reads raw PDF text elements
$bytes = [System.IO.File]::ReadAllBytes($pdfPath)
$content = [System.Text.Encoding]::GetEncoding("ISO-8859-1").GetString($bytes)

# Extract text between BT/ET (text blocks) and parentheses
$textBlocks = @()
$lines = $content -split "`n"
$inText = $false
foreach ($line in $lines) {
    if ($line -match '\((.+?)\)') {
        $matches = [regex]::Matches($line, '\(([^)]+)\)')
        foreach ($m in $matches) {
            $text = $m.Groups[1].Value
            # Filter out binary garbage
            if ($text -match '^[\x20-\x7E\xA0-\xFF]+$' -and $text.Length -gt 1) {
                $textBlocks += $text
            }
        }
    }
}

$textBlocks | Out-File -Encoding utf8 $outPath
Write-Output "Extracted $($textBlocks.Count) text fragments to $outPath"
