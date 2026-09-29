#Requires -Version 5.1
# Minimal MCP server (stdio transport) exposing a single "echo" tool.
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

function Send-Message {
    param($Object)
    $json = $Object | ConvertTo-Json -Depth 10 -Compress
    [Console]::Out.Write($json + "`n")
    [Console]::Out.Flush()
}

$stdin = [Console]::In
while ($true) {
    $line = $stdin.ReadLine()
    if ($null -eq $line) { break }
    if ([string]::IsNullOrWhiteSpace($line)) { continue }

    try {
        $msg = $line | ConvertFrom-Json
    } catch {
        continue
    }

    $method = $msg.method
    $id = $msg.id

    switch ($method) {
        'initialize' {
            Send-Message @{
                jsonrpc = '2.0'
                id      = $id
                result  = @{
                    protocolVersion = '2024-11-05'
                    capabilities    = @{ tools = @{} }
                    serverInfo      = @{ name = 'echo-windows'; version = '1.0.0' }
                }
            }
        }
        'notifications/initialized' {
            # notifications have no response
        }
        'tools/list' {
            Send-Message @{
                jsonrpc = '2.0'
                id      = $id
                result  = @{
                    tools = @(
                        @{
                            name        = 'echo'
                            description = 'Echoes back the provided message.'
                            inputSchema = @{
                                type       = 'object'
                                properties = @{
                                    message = @{ type = 'string'; description = 'The message to echo back.' }
                                }
                                required   = @('message')
                            }
                        }
                    )
                }
            }
        }
        'tools/call' {
            $toolName = $msg.params.name
            if ($toolName -eq 'echo') {
                $text = [string]$msg.params.arguments.message
                Send-Message @{
                    jsonrpc = '2.0'
                    id      = $id
                    result  = @{
                        content = @(@{ type = 'text'; text = $text })
                    }
                }
            } else {
                Send-Message @{
                    jsonrpc = '2.0'
                    id      = $id
                    error   = @{ code = -32601; message = "Unknown tool: $toolName" }
                }
            }
        }
        'shutdown' {
            Send-Message @{ jsonrpc = '2.0'; id = $id; result = $null }
        }
        default {
            if ($null -ne $id) {
                Send-Message @{
                    jsonrpc = '2.0'
                    id      = $id
                    error   = @{ code = -32601; message = "Method not found: $method" }
                }
            }
        }
    }
}
