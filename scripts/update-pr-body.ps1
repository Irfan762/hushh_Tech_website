param(
    [Parameter(Mandatory=$true)]
    [string]$Token
)

$body = @"
## Summary

- Replaces fixed-width containers (\`max-w-lg\`, \`max-w-6xl\`) with responsive \`max-w-7xl\` containers across all KYC Studio Alpha screens to fully utilize available desktop viewport width.
- Implements \`SimpleGrid\` for the 'User to Verify' form fields (2-column on desktop) and the operations checkboxes (3-column on desktop), stacking vertically on mobile.
- Adds consistent responsive padding (\`px={{ base: 4, md: 8, lg: 12 }}\`) across Setup, Conversation, and Result screens.
- Fixes a runtime crash caused by \`Container\` being used but not imported in \`MissionControlLayout.tsx\`.
- Eliminates the brittle \`calc(100vh - 180px)\` magic number height by switching the Grid to a flex-based layout (\`flex=1\`) that dynamically fills the remaining viewport height.
- Removes double horizontal padding in \`A2AScenarioSetupScreen\` and \`A2AConversationScreen\` by setting \`p={0}\` / \`px={0}\` on the inner Container components.

## Validation

- [x] Verified Setup screen displays user info fields in a 2-column grid on desktop and single column on mobile
- [x] Verified Operations checkboxes render in a 3-column grid on desktop and stack on mobile
- [x] Verified Mission Control 3-pane layout fills the full viewport height without scrollbars on large screens
- [x] Confirmed no double horizontal padding on Setup and Conversation screens across breakpoints
- [x] Confirmed Container import added to MissionControlLayout.tsx - no runtime crash on desktop conversation view
- [ ] Visual QA on tablet (768px) breakpoint to confirm grid transitions

## Notes

- The Signed-off-by trailer has been added to the fix commit to satisfy the DCO requirement.
- The calc(100vh - 180px) approach was replaced with display=flex + flex=1 on both the outer Container and Grid to make the layout resilient to future header/padding changes.
- closes #821
"@

$headers = @{
    "Authorization" = "Bearer $Token"
    "Accept"        = "application/vnd.github+json"
    "X-GitHub-Api-Version" = "2022-11-28"
}

$payload = @{ body = $body } | ConvertTo-Json -Depth 5

$response = Invoke-RestMethod `
    -Uri "https://api.github.com/repos/Irfan762/hushh_Tech_website/pulls/822" `
    -Method Patch `
    -Headers $headers `
    -Body $payload `
    -ContentType "application/json"

Write-Host "PR updated successfully! URL: $($response.html_url)"
