$content = Get-Content 'C:\Users\Ansh\.gemini\antigravity\brain\40e80abe-dff7-4058-84bb-e874619e5f0d\.system_generated\steps\11\content.md' -Raw
$jsonStart = $content.IndexOf('[')
$jsonContent = $content.Substring($jsonStart)
New-Item -ItemType Directory -Force -Path 'e:\Vehicle_Bookings\data' | Out-Null
[System.IO.File]::WriteAllText('e:\Vehicle_Bookings\data\bookings.json', $jsonContent, [System.Text.Encoding]::UTF8)
$fileSize = [math]::Round((Get-Item 'e:\Vehicle_Bookings\data\bookings.json').Length / 1MB, 2)
Write-Host "Dataset extracted. Size: $fileSize MB"
