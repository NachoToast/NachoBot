# Whitelist Module

This whitelist submodule provides a way to whitelist members on a remote Minecraft server via Discord using RCON and an admin acceptance process.

### Dependencies

-   Minecraft Module
-   RCON Module

### Command Progress ✅❌

###### Admin

-   ✅ accept
    -   ✅ broadcast accepted
        -   ✅ with comments
    -   ✅ catch failures on rcon and update db accordingly
-   ✅ reject
    -   ✅ broadcast rejected
        -   ✅ with comments
-   ✅ freeze
-   ✅ ban
    -   ✅ unban
-   ✅ list
-   ✅ clear
-   ✅ info (like status but with vetting info)
-   ✅ suspend (on/query/off)
-   ❌ migration handler
-   ✅ not in server checks

###### Basic

-   ✅ apply
-   -   ✅ broadcast new
-   -   ✅ on behalf of
        -   ✅ with comment
-   ✅ status
    -   ✅ of others too
-   ✅ remove
-   ✅ stats
-   ✅ list commands
