#Requires -Version 5.1
# Minimal MCP server (stdio transport) exposing a single "calculate" tool.
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
                    serverInfo      = @{ name = 'calculate-windows'; version = '1.0.0' }
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
                            name        = 'calculate'
                            description = 'Performs a basic arithmetic operation (add, subtract, multiply, divide) on two numbers.'
                            inputSchema = @{
                                type       = 'object'
                                properties = @{
                                    operation = @{ type = 'string'; enum = @('add', 'subtract', 'multiply', 'divide'); description = 'The arithmetic operation to perform.' }
                                    a         = @{ type = 'number'; description = 'The first operand.' }
                                    b         = @{ type = 'number'; description = 'The second operand.' }
                                }
                                required   = @('operation', 'a', 'b')
                            }
                        }
                    )
                }
            }
        }
        'tools/call' {
            $toolName = $msg.params.name
            if ($toolName -eq 'calculate') {
                $operation = [string]$msg.params.arguments.operation
                $a = [double]$msg.params.arguments.a
                $b = [double]$msg.params.arguments.b

                $result = $null
                $errorMessage = $null
                switch ($operation) {
                    'add' { $result = $a + $b }
                    'subtract' { $result = $a - $b }
                    'multiply' { $result = $a * $b }
                    'divide' {
                        if ($b -eq 0) {
                            $errorMessage = 'Division by zero is not allowed.'
                        } else {
                            $result = $a / $b
                        }
                    }
                    default { $errorMessage = "Unknown operation: $operation" }
                }

                if ($null -ne $errorMessage) {
                    Send-Message @{
                        jsonrpc = '2.0'
                        id      = $id
                        result  = @{
                            content = @(@{ type = 'text'; text = $errorMessage })
                            isError = $true
                        }
                    }
                } else {
                    Send-Message @{
                        jsonrpc = '2.0'
                        id      = $id
                        result  = @{
                            content = @(@{ type = 'text'; text = [string]$result })
                        }
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
