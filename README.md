# Uploadcare cleanup automation

[![Uploadcare cleanup](https://github.com/doffcasescz/uploadcare-cleanup/actions/workflows/start.yaml/badge.svg)](https://github.com/doffcasescz/uploadcare-cleanup/actions/workflows/start.yaml)

Removes files older than 30 days from uploadcare and sends a report to telegram

<img width="794" height="314" alt="CleanShot 2026-06-22 at 18 09 59" src="https://github.com/user-attachments/assets/fd0ab085-ca62-4d86-b81c-d2f487b5a2fd" />

## Functions

1. Cleans up uploadcare uploads folder
2. Sends the report message to telegram chat
3. Commits and pushes the log

**Note**, GH disables automatic actions execution on inactive for more than 60 days repositories

## Configuration of .env example:

See the [./.env.example](./.env.example)
