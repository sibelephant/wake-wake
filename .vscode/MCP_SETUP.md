# MCP Server Configuration for Expo Docs

This project is configured to use the Model Context Protocol (MCP) to access Expo documentation in real-time.

## What's Configured

### Fetch MCP Server

Allows fetching web content from:

- **Expo Documentation**: https://docs.expo.dev/
- **React Native Docs**: https://reactnative.dev/
- **Expo API Reference**: https://docs.expo.dev/versions/latest/

## How It Works

When you ask questions about Expo APIs or features, I can now:

1. Fetch the latest documentation directly from docs.expo.dev
2. Get up-to-date API references for Expo SDK 54
3. Access migration guides and best practices
4. Pull examples from official documentation

## Common Expo Doc URLs I Can Access

### General

- https://docs.expo.dev/get-started/introduction/
- https://docs.expo.dev/workflow/overview/

### File System

- https://docs.expo.dev/versions/latest/sdk/filesystem/
- https://docs.expo.dev/versions/v54.0.0/sdk/filesystem/ (your version)

### Sensors

- https://docs.expo.dev/versions/latest/sdk/accelerometer/
- https://docs.expo.dev/versions/latest/sdk/sensors/

### Notifications

- https://docs.expo.dev/versions/latest/sdk/notifications/
- https://docs.expo.dev/push-notifications/overview/

### Audio

- https://docs.expo.dev/versions/latest/sdk/audio/
- https://docs.expo.dev/versions/latest/sdk/av/

### Document Picker

- https://docs.expo.dev/versions/latest/sdk/document-picker/

### Storage

- https://react-native-async-storage.github.io/async-storage/

### Router

- https://docs.expo.dev/router/introduction/
- https://docs.expo.dev/router/advanced/tabs/

## Usage Examples

Just ask questions like:

- "Check the Expo FileSystem docs for the new API"
- "What does the Expo Notifications API say about scheduling alarms?"
- "Show me the latest Expo Router documentation for tabs"

I'll automatically fetch the relevant documentation and provide accurate, up-to-date answers!

## Requirements

The fetch MCP server requires:

- Python with `uvx` (installed via `pip install uv`)
- Or Node.js with `npx @modelcontextprotocol/server-fetch`

To install uvx:

```bash
pip install uv
# or
pipx install uv
```

## Testing

To verify the MCP server is working, just ask me:
"Fetch the Expo FileSystem documentation"

And I'll pull the latest docs for you! 🚀
