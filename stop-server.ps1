Get-Process java -ErrorAction SilentlyContinue | ForEach-Object {
    if ($_.CommandLine -match 'as-you-cost') {
        Stop-Process -Id $_.Id -Force
        Write-Host "Stopped process $($_.Id)"
    }
}
Start-Sleep -Seconds 2
Write-Host "Done"
