$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

$TokenStorePath = Join-Path $scriptDir ".netlify-token.dpapi"
$NetlifyExe = Join-Path $scriptDir "node_modules\.bin\netlify.cmd"
$NodeBinDir = Join-Path $scriptDir "node_modules\.bin"
$DenoExe = Join-Path $NodeBinDir "deno.cmd"
$NpmExe = "npm.cmd"
$DebugLogPath = Join-Path $scriptDir ("netlify-installer-debug-{0}.log" -f (Get-Date -Format "yyyyMMdd-HHmmss"))

function Mask-Sensitive([string]$Text) {
  $v = [string]$Text
  $v = $v -replace 'nfp_[A-Za-z0-9_\-]+', 'nfp_***'
  return $v
}

function Write-DebugLog([string]$Text) {
  $line = "[{0}] {1}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), (Mask-Sensitive $Text)
  Add-Content -LiteralPath $DebugLogPath -Value $line -Encoding UTF8
}

function Join-ProcessArguments([string[]]$ArgsList) {
  $quoted = foreach ($arg in $ArgsList) {
    $v = [string]$arg
    if ($v -match '^[A-Za-z0-9_./:=@%{}+-]+$') {
      $v
    } else {
      '"' + ($v.Replace('\', '\\').Replace('"', '\"')) + '"'
    }
  }
  return ($quoted -join " ")
}

function Convert-NetlifyErrorMessage([string]$Text) {
  $v = [string]$Text
  if ($v -match 'Account credit usage exceeded|new deploys are blocked until credits are added') {
    return "Netlify blocked this deploy because the account credit/usage limit is exceeded. Add credits/upgrade, or wait until credits reset, then retry."
  }
  if ($v -match 'Cannot create more sites because account has exceeded usage limit') {
    return "Netlify blocked creating a new project because the account site/usage limit is reached. Delete an unused Netlify project or select an existing project."
  }
  if ($v -match 'Project not found') {
    return "Netlify CLI could not find the selected project. Re-select the project from the installer list and retry."
  }
  if ($v -match 'Forbidden' -or $v -match '"status":\s*403') {
    return "Netlify returned 403 Forbidden. Check token access, team/project permission, and account credit/usage status."
  }
  if ($v -match 'Bundling edge functions|edge function failed|deno --version|Deno download') {
    return "Netlify Edge Function bundling failed. This mode needs Deno locally. The installer now installs deno-bin automatically; run again after npm install completes. Debug: $DebugLogPath"
  }
  return $v
}

function Write-Step([string]$Text) {
  Write-Host ""
  Write-Host (">> {0}" -f $Text) -ForegroundColor Yellow
  Write-DebugLog (">> {0}" -f $Text)
}

function Read-Default([string]$Prompt, [string]$Default) {
  $suffix = if ([string]::IsNullOrWhiteSpace($Default)) { "" } else { " [$Default]" }
  $v = Read-Host "$Prompt$suffix"
  if ([string]::IsNullOrWhiteSpace($v)) { return $Default }
  return $v
}

function Read-Required([string]$Prompt) {
  while ($true) {
    $v = Read-Host $Prompt
    if (-not [string]::IsNullOrWhiteSpace($v)) { return $v.Trim() }
    Write-Host "Required value." -ForegroundColor Red
  }
}

function Read-Optional([string]$Prompt) {
  $v = Read-Host $Prompt
  if ($null -eq $v) { return "" }
  return $v.Trim()
}

function Save-TokenSecure([string]$Token) {
  $secure = ConvertTo-SecureString -String $Token -AsPlainText -Force
  $text = ConvertFrom-SecureString -SecureString $secure
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($TokenStorePath, $text, $utf8NoBom)
}

function Load-TokenSecure {
  if (-not (Test-Path $TokenStorePath)) { return "" }
  try {
    $text = (Get-Content $TokenStorePath -Raw).Trim()
    if ([string]::IsNullOrWhiteSpace($text)) { return "" }
    $secure = ConvertTo-SecureString -String $text
    $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    try {
      return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
    } finally {
      [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
    }
  } catch {
    return ""
  }
}

function Invoke-Tool([string[]]$CliArgs, [switch]$AllowFail) {
  if (-not (Test-Path $NetlifyExe)) {
    throw "Netlify CLI not found at $NetlifyExe. Run npm install first."
  }
  Add-LocalNodeBinToPath
  Write-DebugLog ("RUN: {0} {1}" -f $NetlifyExe, ($CliArgs -join " "))
  $tmpBase = Join-Path $env:TEMP ("xhttprelaynf-netlify-{0}" -f ([guid]::NewGuid().ToString("N")))
  $stdoutPath = "$tmpBase.out"
  $stderrPath = "$tmpBase.err"
  $process = Start-Process -FilePath $NetlifyExe -ArgumentList $CliArgs -NoNewWindow -Wait -PassThru -RedirectStandardOutput $stdoutPath -RedirectStandardError $stderrPath
  $code = [int]$process.ExitCode
  $stdout = ""
  $stderr = ""
  if (Test-Path $stdoutPath) { $stdout = Get-Content -LiteralPath $stdoutPath -Raw -ErrorAction SilentlyContinue }
  if (Test-Path $stderrPath) { $stderr = Get-Content -LiteralPath $stderrPath -Raw -ErrorAction SilentlyContinue }
  Remove-Item -LiteralPath $stdoutPath, $stderrPath -Force -ErrorAction SilentlyContinue
  $textParts = @()
  if (-not [string]::IsNullOrWhiteSpace($stdout)) { $textParts += $stdout.Trim() }
  if (-not [string]::IsNullOrWhiteSpace($stderr)) { $textParts += $stderr.Trim() }
  $text = ($textParts -join "`n").Trim()
  $out = if ([string]::IsNullOrWhiteSpace($text)) { @() } else { @($text -split "`r?`n") }
  $text = $text.Trim()
  Write-DebugLog ("EXIT: {0}" -f $code)
  if (-not [string]::IsNullOrWhiteSpace($text)) {
    Write-DebugLog ("OUTPUT:`n{0}" -f $text)
  }
  if ($code -ne 0 -and -not $AllowFail) {
    if ([string]::IsNullOrWhiteSpace($text)) { $text = "unknown Netlify CLI error" }
    throw (Convert-NetlifyErrorMessage $text)
  }
  return @{
    ExitCode = $code
    Output = @($out)
    Text = $text
  }
}

function Ensure-NodeAndNpm {
  if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw "Node.js is not installed." }
  if (-not (Get-Command $NpmExe -ErrorAction SilentlyContinue)) { throw "npm.cmd is not installed." }
  Write-Host "Node/npm found." -ForegroundColor Green
}

function Add-LocalNodeBinToPath {
  if (-not (Test-Path $NodeBinDir)) { return }
  $parts = @(([string]$env:PATH) -split ';' | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
  if ($parts -notcontains $NodeBinDir) {
    $env:PATH = "$NodeBinDir;$env:PATH"
  }
}

function Ensure-NetlifyCli {
  if (-not (Test-Path $NetlifyExe)) {
    Write-Step "Installing Netlify CLI locally..."
    & $NpmExe install | Out-Host
    if ($LASTEXITCODE -ne 0) { throw "npm install failed." }
    if (-not (Test-Path $NetlifyExe)) { throw "Netlify CLI not found after npm install." }
  } else {
    Write-Host "Netlify CLI already installed locally." -ForegroundColor Green
  }
  Add-LocalNodeBinToPath
}

function Ensure-DenoForEdge {
  Add-LocalNodeBinToPath
  if (-not (Test-Path $DenoExe)) {
    Write-Step "Installing local Deno runtime for Netlify Edge Functions..."
    & $NpmExe install | Out-Host
    if ($LASTEXITCODE -ne 0) { throw "npm install failed while installing local Deno runtime." }
  }
  if (-not (Test-Path $DenoExe)) {
    throw "Local Deno runtime was not found after npm install. Edge mode cannot deploy without Deno."
  }
  $denoVersion = (& $DenoExe --version 2>$null | Select-Object -First 1)
  if ([string]::IsNullOrWhiteSpace($denoVersion)) {
    throw "Local Deno runtime exists but did not run correctly. Re-run npm install, then retry Edge mode."
  }
  Write-Host ("Local Deno ready for Edge bundling: {0}" -f $denoVersion) -ForegroundColor Green
}

function Ensure-NetlifyToken {
  Write-Step "Checking Netlify token..."
  $token = ""
  $saved = Load-TokenSecure
  if (-not [string]::IsNullOrWhiteSpace($saved)) {
    $useSaved = Read-Default "Use saved encrypted Netlify token? (Y/n)" "y"
    if ($useSaved.ToLowerInvariant() -ne "n") {
      $token = $saved
      Write-Host "Using saved encrypted token." -ForegroundColor Green
    }
  }
  if ([string]::IsNullOrWhiteSpace($token)) {
    $token = Read-Required "Paste Netlify token"
    $save = Read-Default "Save token encrypted in this project folder? (Y/n)" "y"
    if ($save.ToLowerInvariant() -ne "n") {
      Save-TokenSecure -Token $token
      Write-Host "Token saved securely: $TokenStorePath" -ForegroundColor Green
    }
  }
  $env:NETLIFY_AUTH_TOKEN = $token.Trim()
  try {
    $null = Invoke-NetlifyApiGet -Path "/sites"
  } catch {
    throw "Netlify token check failed. Create a fresh Personal Access Token and retry."
  }
}

function Invoke-NetlifyApiGet([string]$Path) {
  $token = [string]$env:NETLIFY_AUTH_TOKEN
  if ([string]::IsNullOrWhiteSpace($token)) { throw "Netlify token is missing." }
  $p = if ($Path.StartsWith("/")) { $Path } else { "/$Path" }
  Write-DebugLog ("API GET {0}" -f $p)
  return Invoke-RestMethod -Method Get -Uri "https://api.netlify.com/api/v1$p" -Headers @{ Authorization = "Bearer $token" } -TimeoutSec 45
}

function Invoke-NetlifyApiPost([string]$Path, [hashtable]$Body) {
  $token = [string]$env:NETLIFY_AUTH_TOKEN
  if ([string]::IsNullOrWhiteSpace($token)) { throw "Netlify token is missing." }
  $p = if ($Path.StartsWith("/")) { $Path } else { "/$Path" }
  $json = $Body | ConvertTo-Json -Depth 20
  Write-DebugLog ("API POST {0}" -f $p)
  return Invoke-RestMethod -Method Post -Uri "https://api.netlify.com/api/v1$p" -Headers @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
  } -Body $json -TimeoutSec 45
}

function Invoke-NetlifyApiDelete([string]$Path) {
  $token = [string]$env:NETLIFY_AUTH_TOKEN
  if ([string]::IsNullOrWhiteSpace($token)) { throw "Netlify token is missing." }
  $p = if ($Path.StartsWith("/")) { $Path } else { "/$Path" }
  Write-DebugLog ("API DELETE {0}" -f $p)
  return Invoke-RestMethod -Method Delete -Uri "https://api.netlify.com/api/v1$p" -Headers @{ Authorization = "Bearer $token" } -TimeoutSec 45
}

function Convert-NetlifyJsonOutput([string]$Text) {
  $raw = ([string]$Text).Trim()
  if ([string]::IsNullOrWhiteSpace($raw)) { throw "Netlify CLI returned empty JSON output." }
  try {
    return ($raw | ConvertFrom-Json)
  } catch {}

  $start = $raw.IndexOf("{")
  $end = $raw.LastIndexOf("}")
  if ($start -ge 0 -and $end -gt $start) {
    $candidate = $raw.Substring($start, $end - $start + 1)
    return ($candidate | ConvertFrom-Json)
  }
  throw "Could not parse Netlify JSON output."
}

function Normalize-PathLike([string]$PathValue) {
  $v = ([string]$PathValue).Trim()
  if ([string]::IsNullOrWhiteSpace($v)) { return "/api" }
  if (-not $v.StartsWith("/")) { $v = "/$v" }
  if ($v.Length -gt 1 -and $v.EndsWith("/")) { $v = $v.TrimEnd("/") }
  return $v
}

function New-RandomSiteName {
  $chars = "abcdefghijklmnopqrstuvwxyz0123456789".ToCharArray()
  $s = ""
  for ($i = 0; $i -lt 8; $i++) { $s += $chars[(Get-Random -Minimum 0 -Maximum $chars.Length)] }
  return "xhttprelaynf-$s"
}

function Format-Mbps([string]$Bps) {
  $n = 0.0
  if (-not [double]::TryParse([string]$Bps, [ref]$n)) { return [string]$Bps }
  if ($n -le 0) { return "no throttle" }
  return ("{0:0.##} MB/s" -f ($n / 1048576.0))
}

function Estimate-BandwidthCreditsPerHour([string]$UpBps, [string]$DownBps) {
  $up = 0.0
  $down = 0.0
  [void][double]::TryParse([string]$UpBps, [ref]$up)
  [void][double]::TryParse([string]$DownBps, [ref]$down)
  if (($up + $down) -le 0) { return "uncapped by relay; charged by actual bandwidth" }
  $gbPerHour = (($up + $down) * 3600.0) / 1000000000.0
  $creditsPerHour = $gbPerHour * 10.0
  return ("max transfer ~{0:0.##} GB/hour => ~{1:0.#} credits/hour if saturated" -f $gbPerHour, $creditsPerHour)
}

function Estimate-ComputeCreditsPerHour([string]$MaxInflight) {
  $n = 0
  if (-not [int]::TryParse([string]$MaxInflight, [ref]$n)) { return "variable" }
  return ("up to ~{0} credits/hour if {1} long requests stay active for a full hour" -f ($n * 5), $n)
}

function Read-IntDefault([string]$Prompt, [string]$Default) {
  while ($true) {
    $v = Read-Default $Prompt $Default
    $n = 0
    if ([int]::TryParse($v, [ref]$n) -and $n -ge 0) { return [string]$n }
    Write-Host "Enter a non-negative number." -ForegroundColor Red
  }
}

function Show-NetlifyCreditModel {
  Write-Host ""
  Write-Host "Netlify credit model for this installer:" -ForegroundColor Cyan
  Write-Host "  Local build                 : 0 credits on Netlify" -ForegroundColor DarkGray
  Write-Host "  Create/link project + ENV   : 0 listed credits (API management)" -ForegroundColor DarkGray
  Write-Host "  Each production deploy      : 15 credits" -ForegroundColor Yellow
  Write-Host "  Function compute runtime    : 5 credits / GB-hour (Netlify Function memory is 1024 MB)" -ForegroundColor Yellow
  Write-Host "  Edge Function compute       : no serverless compute credit; measured through web requests/edge invocations" -ForegroundColor Yellow
  Write-Host "  Bandwidth                   : 10 credits / GB" -ForegroundColor Yellow
  Write-Host "  Web requests                : 2 credits / 10,000 requests" -ForegroundColor Yellow
}

function Show-ProfileCreditEstimate($Profile) {
  Write-Host ""
  Write-Host "Selected profile credit estimate:" -ForegroundColor Cyan
  Write-Host ("  Profile        : {0}" -f $Profile.ModeKey)
  Write-Host ("  Runtime        : {0}" -f $Profile.Runtime)
  if ([string]$Profile.Runtime -eq "edge") {
    Write-Host "  Latency        : lower ping path; runs at Netlify Edge before normal functions" -ForegroundColor Green
    Write-Host ("  Client path    : {0}" -f $Profile.PublicRelayPath)
    Write-Host ("  Upstream path  : {0}" -f $Profile.UpstreamPathPrefix)
    Write-Host ("  Methods        : {0}" -f $Profile.AllowedMethods)
  } else {
    Write-Host ("  In-flight cap  : {0}" -f $Profile.MaxInflight)
    Write-Host ("  Upload cap     : {0}" -f (Format-Mbps $Profile.MaxUpBps))
    Write-Host ("  Download cap   : {0}" -f (Format-Mbps $Profile.MaxDownBps))
  }
  Write-Host ("  Timeout        : {0}s" -f ([int]$Profile.UpstreamTimeoutMs / 1000))
  if ([string]$Profile.Runtime -eq "edge") {
    Write-Host "  Bandwidth risk : charged by actual outgoing bandwidth; no relay throttle in Edge mode" -ForegroundColor DarkYellow
    Write-Host "  Compute risk   : no Netlify serverless compute credit, but every relay hit is a web/edge request" -ForegroundColor DarkYellow
  } else {
    Write-Host ("  Bandwidth risk : {0}" -f (Estimate-BandwidthCreditsPerHour $Profile.MaxUpBps $Profile.MaxDownBps)) -ForegroundColor DarkYellow
    Write-Host ("  Compute risk   : {0}" -f (Estimate-ComputeCreditsPerHour $Profile.MaxInflight)) -ForegroundColor DarkYellow
  }
  Write-Host "  Deploy cost    : +15 credits when you confirm production deploy" -ForegroundColor Yellow
}

function Choose-Profile {
  Show-NetlifyCreditModel
  Write-Host ""
  Write-Host "Choose Netlify deploy profile:" -ForegroundColor Cyan
  Write-Host "[0] Back"
  Write-Host ""
  Write-Host "[1] EDGE LOW PING ECO" -ForegroundColor Green
  Write-Host "    Edge Function. Lower ping path. /api -> upstream /api. GET/POST only. 30s timeout."
  Write-Host ""
  Write-Host "[2] EDGE LOW PING OPEN" -ForegroundColor Green
  Write-Host "    Edge Function. Lower ping path. All common methods. 30s timeout."
  Write-Host ""
  Write-Host "[3] EDGE LOW PING LONG" -ForegroundColor Green
  Write-Host "    Edge Function. Lower ping path. All common methods. 39s timeout near Edge header limit."
  Write-Host ""
  Write-Host "[4] FUNCTION ECO CREDITS" -ForegroundColor Green
  Write-Host "    Node Function. 64 conn | 1 MB/s up/down | 60s timeout. More controls, higher ping."
  Write-Host ""
  Write-Host "[5] FUNCTION BALANCED" -ForegroundColor Green
  Write-Host "    Node Function. 128 conn | 2.5 MB/s up/down | 60s timeout."
  Write-Host ""
  Write-Host "[6] FUNCTION HIGH CONN" -ForegroundColor Green
  Write-Host "    Node Function. 256 conn | 5 MB/s up/down | 60s timeout."
  Write-Host ""
  Write-Host "[7] FUNCTION MAX STABILITY" -ForegroundColor Green
  Write-Host "    Node Function. 128 conn | no throttle | 60s timeout. Highest bandwidth-credit risk."
  Write-Host ""
  Write-Host "[8] CUSTOM BUILD" -ForegroundColor Green
  Write-Host "    Build your own Edge/Function profile and skip optional controls you do not want."
  Write-Host ""
  $pick = Read-Default "Select profile" "1"
  switch ($pick) {
    "0" { return $null }
    "2" {
      return @{
        ModeKey = "NETLIFY_EDGE_LOW_PING_OPEN"
        Runtime = "edge"
        PublicRelayPath = "/api"
        UpstreamPathPrefix = "/api"
        AllowedMethods = "GET,POST,PUT,PATCH,DELETE,OPTIONS,HEAD"
        UpstreamTimeoutMs = "30000"
      }
    }
    "3" {
      return @{
        ModeKey = "NETLIFY_EDGE_LOW_PING_LONG"
        Runtime = "edge"
        PublicRelayPath = "/api"
        UpstreamPathPrefix = "/api"
        AllowedMethods = "GET,POST,PUT,PATCH,DELETE,OPTIONS,HEAD"
        UpstreamTimeoutMs = "39000"
      }
    }
    "4" {
      return @{
        ModeKey = "NETLIFY_FUNCTION_ECO_CREDITS"
        Runtime = "function"
        MaxInflight = "64"
        MaxUpBps = "1048576"
        MaxDownBps = "1048576"
        UpstreamTimeoutMs = "60000"
      }
    }
    "5" {
      return @{
        ModeKey = "NETLIFY_FUNCTION_BALANCED"
        Runtime = "function"
        MaxInflight = "128"
        MaxUpBps = "2621440"
        MaxDownBps = "2621440"
        UpstreamTimeoutMs = "60000"
      }
    }
    "6" {
      return @{
        ModeKey = "NETLIFY_FUNCTION_HIGH_CONN"
        Runtime = "function"
        MaxInflight = "256"
        MaxUpBps = "5242880"
        MaxDownBps = "5242880"
        UpstreamTimeoutMs = "60000"
      }
    }
    "7" {
      return @{
        ModeKey = "NETLIFY_FUNCTION_MAX_STABILITY"
        Runtime = "function"
        MaxInflight = "128"
        MaxUpBps = "0"
        MaxDownBps = "0"
        UpstreamTimeoutMs = "60000"
      }
    }
    "8" { return Read-CustomProfile }
    default {
      return @{
        ModeKey = "NETLIFY_EDGE_LOW_PING_ECO"
        Runtime = "edge"
        PublicRelayPath = "/api"
        UpstreamPathPrefix = "/api"
        AllowedMethods = "GET,POST"
        UpstreamTimeoutMs = "30000"
      }
    }
  }
}

function Read-CustomProfile {
  Write-Host ""
  Write-Host "Custom Build:" -ForegroundColor Cyan
  $runtime = (Read-Default "Runtime: edge or function" "edge").Trim().ToLowerInvariant()
  if ($runtime -ne "function") { $runtime = "edge" }
  if ($runtime -eq "edge") {
    return @{
      ModeKey = "NETLIFY_EDGE_CUSTOM"
      Runtime = "edge"
      PublicRelayPath = Normalize-PathLike (Read-Default "Client/public path" "/api")
      UpstreamPathPrefix = Normalize-PathLike (Read-Default "Upstream path prefix" "/api")
      AllowedMethods = (Read-Default "Allowed methods" "GET,POST,PUT,PATCH,DELETE,OPTIONS,HEAD").Trim()
      UpstreamTimeoutMs = Read-IntDefault "UPSTREAM_TIMEOUT_MS (1000-39000 recommended)" "30000"
    }
  }
  return @{
    ModeKey = "NETLIFY_FUNCTION_CUSTOM"
    Runtime = "function"
    MaxInflight = Read-IntDefault "MAX_INFLIGHT (0 = skip/default)" "128"
    MaxUpBps = Read-IntDefault "MAX_UP_BPS bytes/sec (0 = no throttle)" "2621440"
    MaxDownBps = Read-IntDefault "MAX_DOWN_BPS bytes/sec (0 = no throttle)" "2621440"
    UpstreamTimeoutMs = Read-IntDefault "UPSTREAM_TIMEOUT_MS" "60000"
  }
}

function Get-Sites {
  try {
    $raw = Invoke-NetlifyApiGet -Path "/sites"
    $flat = New-Object System.Collections.Generic.List[object]
    foreach ($item in @($raw)) {
      if ($item -is [System.Array]) {
        foreach ($nested in $item) {
          if ($null -ne $nested -and -not [string]::IsNullOrWhiteSpace([string]$nested.id) -and -not [string]::IsNullOrWhiteSpace([string]$nested.name)) {
            $flat.Add($nested)
          }
        }
      } elseif ($null -ne $item -and -not [string]::IsNullOrWhiteSpace([string]$item.id) -and -not [string]::IsNullOrWhiteSpace([string]$item.name)) {
        $flat.Add($item)
      }
    }
    return @($flat.ToArray())
  } catch {
    return @()
  }
}

function Choose-SiteTarget {
  Write-Step "Loading Netlify projects..."
  $sites = @(Get-Sites | Sort-Object name)
  Write-Host ""
  Write-Host "Choose a target:" -ForegroundColor Cyan
  $i = 1
  foreach ($s in $sites) {
    $siteName = [string]$s.name
    if ([string]::IsNullOrWhiteSpace($siteName) -or $siteName -eq "System.Object[]") { $siteName = [string]$s.id }
    Write-Host ("[{0}] Use existing project: {1}" -f $i, $siteName)
    $i++
  }
  $newIndex = $sites.Count + 1
  Write-Host ("[{0}] Deploy as NEW project" -f $newIndex)
  $default = if ($sites.Count -gt 0) { "1" } else { [string]$newIndex }
  while ($true) {
    $pick = Read-Default "Select one option" $default
    $n = 0
    if (-not [int]::TryParse($pick, [ref]$n)) {
      Write-Host "Invalid number." -ForegroundColor Red
      continue
    }
    if ($n -ge 1 -and $n -le $sites.Count) {
      $s = $sites[$n - 1]
      return @{ Mode = "existing"; SiteId = [string]$s.id; SiteName = [string]$s.name }
    }
    if ($n -eq $newIndex) {
      $name = Read-Default "New Netlify project name" (New-RandomSiteName)
      return @{ Mode = "new"; SiteId = ""; SiteName = $name.Trim() }
    }
    Write-Host "Invalid selection." -ForegroundColor Red
  }
}

function Link-Site([string]$SiteId) {
  if ([string]::IsNullOrWhiteSpace($SiteId)) { return }
  Write-Step "Linking local folder to Netlify project... (0 listed credits)"
  $null = Invoke-Tool -CliArgs @("link", "--id", $SiteId)
}

function Set-NetlifyEnv([string]$Key, [string]$Value, [string]$SiteId, [string]$AccountSlug) {
  if ([string]::IsNullOrWhiteSpace($SiteId) -or [string]::IsNullOrWhiteSpace($AccountSlug)) {
    throw "Site id/account slug is required for Netlify env update."
  }
  $encodedKey = [uri]::EscapeDataString($Key)
  $encodedSiteId = [uri]::EscapeDataString($SiteId)
  if ([string]::IsNullOrWhiteSpace($Value)) {
    try {
      $null = Invoke-NetlifyApiDelete -Path ("/accounts/{0}/env/{1}?site_id={2}" -f $AccountSlug, $encodedKey, $encodedSiteId)
    } catch {}
    return
  }
  try {
    $null = Invoke-NetlifyApiDelete -Path ("/accounts/{0}/env/{1}?site_id={2}" -f $AccountSlug, $encodedKey, $encodedSiteId)
  } catch {}
  $body = @{
    _json = @(
      @{
        key = $Key
        values = @(
          @{
            value = $Value
            context = "all"
            scopes = @("builds", "functions", "runtime", "post_processing")
          }
        )
      }
    )
  }
  $null = Invoke-NetlifyApiPost -Path ("/accounts/{0}/env?site_id={1}" -f $AccountSlug, $encodedSiteId) -Body $body
}

function Apply-Env($cfg) {
  Write-Step "Setting Netlify production/runtime env vars... (0 listed credits)"
  $site = Invoke-NetlifyApiGet -Path ("/sites/{0}" -f $cfg.SiteId)
  $accountSlug = [string]$site.account_slug
  if ([string]::IsNullOrWhiteSpace($accountSlug)) { throw "Could not resolve Netlify account slug for selected site." }
  Set-NetlifyEnv -Key "TARGET_DOMAIN" -Value $cfg.TargetDomain -SiteId $cfg.SiteId -AccountSlug $accountSlug
  Set-NetlifyEnv -Key "PUBLIC_RELAY_PATH" -Value $cfg.PublicRelayPath -SiteId $cfg.SiteId -AccountSlug $accountSlug
  Set-NetlifyEnv -Key "UPSTREAM_TIMEOUT_MS" -Value $cfg.UpstreamTimeoutMs -SiteId $cfg.SiteId -AccountSlug $accountSlug
  Set-NetlifyEnv -Key "RELAY_KEY" -Value $cfg.RelayKey -SiteId $cfg.SiteId -AccountSlug $accountSlug
  if ([string]$cfg.Runtime -eq "edge") {
    Set-NetlifyEnv -Key "UPSTREAM_PATH_PREFIX" -Value $cfg.UpstreamPathPrefix -SiteId $cfg.SiteId -AccountSlug $accountSlug
    Set-NetlifyEnv -Key "ALLOWED_METHODS" -Value $cfg.AllowedMethods -SiteId $cfg.SiteId -AccountSlug $accountSlug
    foreach ($unused in @("RELAY_PATH", "MAX_INFLIGHT", "MAX_UP_BPS", "MAX_DOWN_BPS", "NETLIFY_RELAY_MODE", "SUCCESS_LOG_SAMPLE_RATE", "SUCCESS_LOG_MIN_DURATION_MS", "ERROR_LOG_MIN_INTERVAL_MS", "UPSTREAM_DNS_ORDER")) {
      Set-NetlifyEnv -Key $unused -Value "" -SiteId $cfg.SiteId -AccountSlug $accountSlug
    }
  } else {
    Set-NetlifyEnv -Key "RELAY_PATH" -Value $cfg.RelayPath -SiteId $cfg.SiteId -AccountSlug $accountSlug
    $maxInflightValue = if ($cfg.ModeKey -match "CUSTOM" -and [string]$cfg.MaxInflight -eq "0") { "" } else { $cfg.MaxInflight }
    $maxUpValue = if ($cfg.ModeKey -match "CUSTOM" -and [string]$cfg.MaxUpBps -eq "0") { "" } else { $cfg.MaxUpBps }
    $maxDownValue = if ($cfg.ModeKey -match "CUSTOM" -and [string]$cfg.MaxDownBps -eq "0") { "" } else { $cfg.MaxDownBps }
    Set-NetlifyEnv -Key "MAX_INFLIGHT" -Value $maxInflightValue -SiteId $cfg.SiteId -AccountSlug $accountSlug
    Set-NetlifyEnv -Key "MAX_UP_BPS" -Value $maxUpValue -SiteId $cfg.SiteId -AccountSlug $accountSlug
    Set-NetlifyEnv -Key "MAX_DOWN_BPS" -Value $maxDownValue -SiteId $cfg.SiteId -AccountSlug $accountSlug
    foreach ($unused in @("UPSTREAM_PATH_PREFIX", "ALLOWED_METHODS", "NETLIFY_RELAY_MODE", "SUCCESS_LOG_SAMPLE_RATE", "SUCCESS_LOG_MIN_DURATION_MS", "ERROR_LOG_MIN_INTERVAL_MS", "UPSTREAM_DNS_ORDER")) {
      Set-NetlifyEnv -Key $unused -Value "" -SiteId $cfg.SiteId -AccountSlug $accountSlug
    }
  }
  Write-Host "Netlify env vars synced." -ForegroundColor Green
}

function Write-NetlifyTomlForRuntime([string]$Runtime) {
  $lines = @(
    "[build]",
    "  command = `"npm run build`"",
    "  publish = `"public`"",
    "",
    "[functions]",
    "  directory = `"netlify/functions`"",
    "  node_bundler = `"esbuild`"",
    "",
    "[build.processing.html]",
    "  pretty_urls = false"
  )
  if ($Runtime -eq "edge") {
    $lines += @(
      "",
      "[[edge_functions]]",
      "  function = `"relay`"",
      "  path = `"/*`""
    )
  }
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText((Join-Path $scriptDir "netlify.toml"), (($lines -join "`n") + "`n"), $utf8NoBom)
  Write-DebugLog ("netlify.toml generated for runtime={0}" -f $Runtime)
}

function Build-Local($cfg) {
  Write-Step "Building local Netlify output... (0 Netlify credits)"
  if ([string]$cfg.Runtime -eq "edge") {
    Ensure-DenoForEdge
  }
  Write-NetlifyTomlForRuntime -Runtime ([string]$cfg.Runtime)
  $env:TARGET_DOMAIN = $cfg.TargetDomain
  $env:PUBLIC_RELAY_PATH = $cfg.PublicRelayPath
  if ([string]$cfg.Runtime -eq "edge") {
    $env:RELAY_PATH = $cfg.UpstreamPathPrefix
    $env:NETLIFY_RELAY_MODE = "edge"
  } else {
    $env:RELAY_PATH = $cfg.RelayPath
    $env:NETLIFY_RELAY_MODE = "function"
  }
  & $NpmExe run build | Out-Host
  if ($LASTEXITCODE -ne 0) { throw "npm run build failed." }
}

function Create-NewSitePlaceholder([string]$SiteName) {
  Write-Step "Creating Netlify project... (0 listed credits, may be blocked by account limits)"
  if (Test-Path (Join-Path $scriptDir ".netlify")) {
    Remove-Item -LiteralPath (Join-Path $scriptDir ".netlify") -Recurse -Force -ErrorAction SilentlyContinue
  }
  try {
    $site = Invoke-NetlifyApiPost -Path "/sites" -Body @{ name = $SiteName }
  } catch {
    throw (Convert-NetlifyErrorMessage $_.Exception.Message)
  }
  return @{ SiteId = [string]$site.id; SiteName = [string]$site.name }
}

function Deploy-Production($cfg) {
  Write-Step ("Deploying Netlify {0} mode to production... (+15 credits on successful production deploy)" -f $cfg.Runtime)
  if ([string]$cfg.Runtime -eq "edge") {
    Ensure-DenoForEdge
  }
  if ([string]::IsNullOrWhiteSpace([string]$cfg.SiteId)) {
    throw "Missing Netlify site id before deploy."
  }
  $siteSelector = [string]$cfg.SiteName
  if ([string]::IsNullOrWhiteSpace($siteSelector)) { $siteSelector = [string]$cfg.SiteId }
  $siteArgs = @("--site", $siteSelector)
  $res = Invoke-Tool -CliArgs (@("deploy", "--prod", "--dir", "public", "--functions", "netlify/functions", "--no-build", "--message", ("{0}-deploy" -f $cfg.ModeKey)) + $siteArgs)
  $url = ""
  $deployUrl = ""
  foreach ($line in @($res.Output)) {
    $text = [string]$line
    if ($text -match 'Deployed to production URL:\s*(https://\S+)') { $url = $Matches[1] }
    if ($text -match 'Unique deploy URL:\s*(https://\S+)') { $deployUrl = $Matches[1] }
  }
  if ([string]::IsNullOrWhiteSpace($url) -and [string]$res.Text -match 'USAGE\s+\$ netlify') {
    throw "Netlify CLI printed help instead of deploying. Debug log: $DebugLogPath"
  }
  if ([string]::IsNullOrWhiteSpace($url)) {
    $site = $null
    if (-not [string]::IsNullOrWhiteSpace([string]$cfg.SiteId)) {
      try { $site = Invoke-NetlifyApiGet -Path ("/sites/{0}" -f $cfg.SiteId) } catch {}
    }
    if ($null -ne $site) {
      if (-not [string]::IsNullOrWhiteSpace([string]$site.ssl_url)) { $url = [string]$site.ssl_url }
      elseif (-not [string]::IsNullOrWhiteSpace([string]$site.url)) { $url = [string]$site.url }
    }
  }
  if ([string]::IsNullOrWhiteSpace($url) -and -not [string]::IsNullOrWhiteSpace([string]$cfg.SiteName)) {
    $url = "https://$($cfg.SiteName).netlify.app"
  }
  if ([string]::IsNullOrWhiteSpace($deployUrl)) { $deployUrl = $url }
  return [pscustomobject]@{
    site_id = [string]$cfg.SiteId
    site_name = [string]$cfg.SiteName
    url = $url
    deploy_url = $deployUrl
    deploy_id = ""
    logs = ""
  }
}

function Confirm-NetlifyDeployment($cfg, $deploy) {
  Write-Step "Verifying Netlify deployment with API..."
  $site = $null
  for ($i = 1; $i -le 12; $i++) {
    $site = Invoke-NetlifyApiGet -Path ("/sites/{0}" -f $cfg.SiteId)
    $siteName = [string]$site.name
    $deployId = [string]$site.deploy_id
    $state = [string]$site.state
    Write-DebugLog ("VERIFY attempt={0} site={1} site_id={2} state={3} deploy_id={4}" -f $i, $siteName, $cfg.SiteId, $state, $deployId)
    if (-not [string]::IsNullOrWhiteSpace($deployId)) {
      $deploy.deploy_id = $deployId
      if (-not [string]::IsNullOrWhiteSpace([string]$site.ssl_url)) { $deploy.url = [string]$site.ssl_url }
      elseif (-not [string]::IsNullOrWhiteSpace([string]$site.url)) { $deploy.url = [string]$site.url }
      try {
        $published = Invoke-NetlifyApiGet -Path ("/deploys/{0}" -f $deployId)
        Write-DebugLog ("PUBLISHED deploy_id={0} state={1} error={2} url={3}" -f $deployId, [string]$published.state, [string]$published.error_message, [string]$published.deploy_ssl_url)
        if ([string]$published.state -eq "error") {
          throw ("Netlify deploy failed: {0}" -f [string]$published.error_message)
        }
        if (-not [string]::IsNullOrWhiteSpace([string]$published.deploy_ssl_url)) { $deploy.deploy_url = [string]$published.deploy_ssl_url }
      } catch {
        Write-DebugLog ("Deploy detail read failed: {0}" -f $_.Exception.Message)
      }
      Write-Host ("Verified: published deploy id {0}" -f $deployId) -ForegroundColor Green
      return $deploy
    }
    if ($i -lt 12) {
      Write-Host ("Netlify API still shows no published deploy for {0}. Retrying in 5s ({1}/12)..." -f $cfg.SiteName, $i) -ForegroundColor DarkYellow
      Start-Sleep -Seconds 5
    }
  }

  $hint = "Netlify CLI returned success, but API still says this project has no published deploy. Debug log: $DebugLogPath"
  Write-DebugLog $hint
  throw $hint
}

function Run-HealthCheck([string]$Url, [string]$RelayPath, [string]$FallbackUrl = "") {
  Write-Step "Quick health check..."
  $hostName = ""
  try { $hostName = ([uri]$Url).Host } catch {}
  if (-not [string]::IsNullOrWhiteSpace($hostName)) {
    $resolved = $false
    for ($i = 1; $i -le 6; $i++) {
      try {
        $dns = Resolve-DnsName $hostName -ErrorAction Stop
        if ($dns) {
          $resolved = $true
          break
        }
      } catch {}
      if ($i -lt 6) {
        Write-Host ("DNS is not ready yet for {0}. Retrying in 10s ({1}/6)..." -f $hostName, $i) -ForegroundColor DarkYellow
        Start-Sleep -Seconds 10
      }
    }
    if (-not $resolved) {
      Write-Host ("DNS is not ready yet for {0}. Netlify created the site, but the domain may need a few minutes." -f $hostName) -ForegroundColor Yellow
      if (-not [string]::IsNullOrWhiteSpace($FallbackUrl) -and $FallbackUrl -ne $Url) {
        Write-Host "Testing the unique deploy URL instead..." -ForegroundColor DarkYellow
        $Url = $FallbackUrl
      } else {
        Write-Host "Try the Host in your client again after a short wait." -ForegroundColor Yellow
        return
      }
    }
  }

  $root = Invoke-CurlCheck -Url "$Url/" -Label "root" -TimeoutSec 25
  if ($root -match 'root=000' -and -not [string]::IsNullOrWhiteSpace($FallbackUrl) -and $FallbackUrl -ne $Url) {
    Write-Host "Primary Netlify domain is not reachable from this DNS yet. Testing the unique deploy URL instead..." -ForegroundColor DarkYellow
    $Url = $FallbackUrl
    $root = Invoke-CurlCheck -Url "$Url/" -Label "root" -TimeoutSec 25
  }
  Write-Host $root
  $rp = Normalize-PathLike $RelayPath
  $api = Invoke-CurlCheck -Url "$Url$rp/test" -Label "relay" -TimeoutSec 30
  Write-Host $api
  Write-Host "Note: /api/test may return 400 because it is not a real XHTTP client request." -ForegroundColor DarkYellow
}

function Invoke-CurlCheck([string]$Url, [string]$Label, [int]$TimeoutSec) {
  $tmpBase = Join-Path $env:TEMP ("xhttprelaynf-curl-{0}" -f ([guid]::NewGuid().ToString("N")))
  $bodyPath = "$tmpBase.body"
  $args = @("-4", "-sS", "--max-time", [string]$TimeoutSec, "-o", $bodyPath, "-w", ("{0}=%{{http_code}} time=%{{time_total}}" -f $Label), $Url)
  try {
    $psi = [System.Diagnostics.ProcessStartInfo]::new()
    $psi.FileName = "curl.exe"
    $psi.UseShellExecute = $false
    $psi.RedirectStandardOutput = $true
    $psi.RedirectStandardError = $true
    $psi.CreateNoWindow = $true
    $psi.Arguments = Join-ProcessArguments $args
    $process = [System.Diagnostics.Process]::Start($psi)
    $stdout = $process.StandardOutput.ReadToEnd()
    $stderr = $process.StandardError.ReadToEnd()
    $process.WaitForExit()
    $stdout = ([string]$stdout).Trim()
    $stderr = ([string]$stderr).Trim()
    if ($process.ExitCode -ne 0) {
      Write-DebugLog ("curl check failed label={0} exit={1} url={2} stderr={3}" -f $Label, $process.ExitCode, $Url, $stderr)
      return ("{0}=000 time=0.000000" -f $Label)
    }
    if ([string]::IsNullOrWhiteSpace($stdout)) { return ("{0}=000 time=0.000000" -f $Label) }
    return $stdout
  } finally {
    Remove-Item -LiteralPath $bodyPath -Force -ErrorAction SilentlyContinue
  }
}

function Show-Summary($cfg, $deploy) {
  $url = [string]$deploy.url
  if ([string]::IsNullOrWhiteSpace($url)) { $url = [string]$deploy.deploy_url }
  Write-Host ""
  Write-Host "==============================================" -ForegroundColor Green
  Write-Host "Netlify deployment complete." -ForegroundColor Green
  Write-Host ("Profile: {0}" -f $cfg.ModeKey) -ForegroundColor Green
  Write-Host ("URL:     {0}" -f $url) -ForegroundColor Green
  if (-not [string]::IsNullOrWhiteSpace([string]$deploy.deploy_url) -and [string]$deploy.deploy_url -ne $url) {
    Write-Host ("Unique:  {0}" -f $deploy.deploy_url) -ForegroundColor Green
  }
  if (-not [string]::IsNullOrWhiteSpace([string]$deploy.deploy_id)) {
    Write-Host ("Deploy:  {0}" -f $deploy.deploy_id) -ForegroundColor Green
  }
  if ($url -match '^https?://([^/]+)') {
    Write-Host ""
    Write-Host ("Use this in your client Host field: {0}" -f $Matches[1]) -ForegroundColor Cyan
    Write-Host ("Path: {0}" -f $cfg.PublicRelayPath) -ForegroundColor Cyan
  }
  if (-not [string]::IsNullOrWhiteSpace($cfg.RelayKey)) {
    Write-Host ""
    Write-Host "XHTTP Extra because RELAY_KEY is enabled:" -ForegroundColor Yellow
    Write-Host "{"
    Write-Host '  "headers": {'
    Write-Host ('    "x-relay-key": "{0}"' -f $cfg.RelayKey)
    Write-Host "  }"
    Write-Host "}"
  }
  Write-Host "==============================================" -ForegroundColor Green
  Write-Host ""
}

function Main {
  Write-DebugLog "Installer started."
  Write-Host "=============================================="
  Write-Host " XHTTPRelayNF Windows Installer by @AmirS @ShakerFPS @b3hnamrjd"
  Write-Host " Netlify Function + Edge Function profiles"
  Write-Host "=============================================="
  Write-Host ""
  Write-Host ("Debug log: {0}" -f $DebugLogPath) -ForegroundColor DarkGray
  Write-Host ""
  Write-Host "Important: Edge profiles usually have lower ping; Function profiles have more relay controls." -ForegroundColor Yellow
  Read-Host "Press Enter to continue"

  if (-not (Test-Path (Join-Path $scriptDir "netlify\functions\relay.mjs")) -or -not (Test-Path (Join-Path $scriptDir "netlify\edge-functions\relay.js"))) {
    throw "Netlify relay files not found. Run from XHTTPRelayNF root."
  }
  Ensure-NodeAndNpm
  Ensure-NetlifyCli
  Ensure-NetlifyToken

  $target = Choose-SiteTarget
  $profile = Choose-Profile
  if ($null -eq $profile) { return }

  $targetDomain = Read-Required "TARGET_DOMAIN (example: https://your-domain.com:443)"
  $runtime = [string]$profile.Runtime
  if ([string]::IsNullOrWhiteSpace($runtime)) { $runtime = "function" }
  if ($runtime -eq "edge") {
    if ($profile.ModeKey -match "CUSTOM") {
      $publicRelayPath = Normalize-PathLike $profile.PublicRelayPath
      $upstreamPathPrefix = Normalize-PathLike $profile.UpstreamPathPrefix
    } else {
      $publicRelayPath = Normalize-PathLike (Read-Default "PUBLIC_RELAY_PATH / client Path" ([string]$profile.PublicRelayPath))
      $upstreamPathPrefix = $publicRelayPath
    }
    $relayPath = $upstreamPathPrefix
    Write-Host ("UPSTREAM_PATH_PREFIX auto-set to client path: {0}" -f $upstreamPathPrefix) -ForegroundColor DarkCyan
  } else {
    $relayPath = Normalize-PathLike (Read-Default "RELAY_PATH" "/api")
    $publicRelayPath = $relayPath
    $upstreamPathPrefix = ""
    Write-Host ("PUBLIC_RELAY_PATH auto-set to RELAY_PATH: {0}" -f $publicRelayPath) -ForegroundColor DarkCyan
  }
  $relayKey = Read-Optional "RELAY_KEY optional (empty = no x-relay-key required)"

  $cfg = @{
    SiteName = [string]$target.SiteName
    SiteId = [string]$target.SiteId
    TargetDomain = $targetDomain.Trim().TrimEnd("/")
    RelayPath = $relayPath
    PublicRelayPath = $publicRelayPath
    UpstreamPathPrefix = $upstreamPathPrefix
    RelayKey = $relayKey
    ModeKey = [string]$profile.ModeKey
    Runtime = $runtime
    AllowedMethods = [string]$profile.AllowedMethods
    MaxInflight = [string]$profile.MaxInflight
    MaxUpBps = [string]$profile.MaxUpBps
    MaxDownBps = [string]$profile.MaxDownBps
    UpstreamTimeoutMs = [string]$profile.UpstreamTimeoutMs
  }

  Write-Step "Selected values:"
  Write-Host ("PROJECT_NAME = {0}" -f $cfg.SiteName)
  Write-Host ("DEPLOY_MODE  = {0}" -f $cfg.ModeKey)
  Write-Host ("RUNTIME      = netlify-{0}" -f $cfg.Runtime)
  Write-Host ("TARGET_DOMAIN = {0}" -f $cfg.TargetDomain)
  Write-Host ("PUBLIC_RELAY_PATH = {0}" -f $cfg.PublicRelayPath)
  if ($cfg.Runtime -eq "edge") {
    Write-Host ("UPSTREAM_PATH_PREFIX = {0}" -f $cfg.UpstreamPathPrefix)
    Write-Host ("ALLOWED_METHODS      = {0}" -f $cfg.AllowedMethods)
  } else {
    Write-Host ("RELAY_PATH    = {0}" -f $cfg.RelayPath)
    Write-Host ("MAX_INFLIGHT = {0}" -f $cfg.MaxInflight)
    Write-Host ("MAX_UP_BPS   = {0}" -f $cfg.MaxUpBps)
    Write-Host ("MAX_DOWN_BPS = {0}" -f $cfg.MaxDownBps)
  }
  Write-Host ("UPSTREAM_TIMEOUT_MS = {0}" -f $cfg.UpstreamTimeoutMs)
  if ([string]::IsNullOrWhiteSpace($cfg.RelayKey)) {
    Write-Host "RELAY_KEY = (empty)"
  } else {
    Write-Host "RELAY_KEY = (set)"
  }
  Show-ProfileCreditEstimate $cfg

  $confirm = Read-Default "Continue with Netlify deploy? (Y/n)" "y"
  if ($confirm.ToLowerInvariant() -eq "n") { return }

  Build-Local -cfg $cfg
  if ($target.Mode -eq "new") {
    $created = Create-NewSitePlaceholder -SiteName $cfg.SiteName
    $cfg.SiteId = [string]$created.SiteId
    $cfg.SiteName = [string]$created.SiteName
  } else {
    Link-Site -SiteId $cfg.SiteId
  }
  if (-not [string]::IsNullOrWhiteSpace($cfg.SiteId)) {
    Link-Site -SiteId $cfg.SiteId
  }
  Apply-Env -cfg $cfg
  $deploy = Deploy-Production -cfg $cfg
  $deploy = Confirm-NetlifyDeployment -cfg $cfg -deploy $deploy
  Show-Summary -cfg $cfg -deploy $deploy
  $runCheck = Read-Default "Run quick health check now? (Y/n)" "y"
  if ($runCheck.ToLowerInvariant() -ne "n") {
    Run-HealthCheck -Url ([string]$deploy.url) -RelayPath $cfg.PublicRelayPath -FallbackUrl ([string]$deploy.deploy_url)
  }
}

try {
  Main
} catch {
  Write-DebugLog ("FAILED: {0}" -f $_.Exception.Message)
  Write-Host ""
  Write-Host ("Action failed: {0}" -f $_.Exception.Message) -ForegroundColor Red
  Write-Host ("Debug log: {0}" -f $DebugLogPath) -ForegroundColor Yellow
}
