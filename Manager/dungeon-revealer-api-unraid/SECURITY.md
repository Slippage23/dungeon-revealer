# Security Considerations

## Password Storage

### ⚠️ Current Limitation

The DM password is currently stored in **plaintext** in `config.json`. This is necessary because:

1. **API Authentication**: The password must be sent to Dungeon Revealer's API on every request
2. **No Password Hashing**: Dungeon Revealer uses password authentication, not tokens
3. **Server-side Storage**: The application needs to store credentials to make automated requests

### 🔒 Security Recommendations

#### 1. **File System Permissions** (Primary Protection)

The `config.json` file is stored in `/data` which should have restricted access:

**On Unraid:**

```bash
# Set restrictive permissions on the data directory
chmod 700 /mnt/user/DungeonRevealer/dungeon-revealer-manager
chown nobody:users /mnt/user/DungeonRevealer/dungeon-revealer-manager
```

**In Docker:**
The `/data` volume is only accessible to:

- The container itself
- Users with direct file system access to your Unraid server
- Anyone who can SSH into your Unraid server

#### 2. **Network Security**

- **Local Network Only**: Keep this application on your local network
- **No Port Forwarding**: Never expose port 3002 to the internet
- **VPN Access**: Use a VPN if you need remote access

#### 3. **Use a Dedicated DM Password**

- Create a unique password just for Dungeon Revealer
- Don't reuse passwords from other services
- Change it periodically

#### 4. **Access Control**

Who can see the password in `config.json`:

- ✅ Unraid administrators (root SSH access)
- ✅ Users with access to the Unraid share
- ❌ Regular users viewing the web interface (password not shown in UI)
- ❌ Network sniffers (if using local network only)

### 🛡️ Future Improvements

Potential enhancements for better security:

#### Option 1: Environment Variables

Store password as Docker environment variable instead:

```bash
docker run -d \
  -e DR_PASSWORD="your-password" \
  slippage/dungeon-revealer-manager:latest
```

#### Option 2: Secrets Management

Use Docker secrets (for Docker Swarm) or Kubernetes secrets

#### Option 3: OAuth/Token-Based Auth

Would require changes to Dungeon Revealer itself to support token-based authentication

---

## Alternative: Environment Variable Approach

If you prefer environment variables over config file:

### 1. Modify Docker Run Command

```bash
docker run -d \
  --name='DungeonRevealerManager' \
  --net='bridge' \
  -p '3002:3001/tcp' \
  -v '/mnt/user/DungeonRevealer/dungeon-revealer-manager':'/data':'rw' \
  -e DR_SERVER_URL="http://172.17.0.5:3000" \
  -e DR_PASSWORD="your-dm-password" \
  slippage/dungeon-revealer-manager:latest
```

### 2. Update server.js to read from environment

```javascript
// In server.js, modify default config:
let config = {
  serverUrl: process.env.DR_SERVER_URL || "",
  dmPassword: process.env.DR_PASSWORD || "",
  // ... rest of config
};
```

**Pros:**

- Password not in config file
- Environment vars are harder to accidentally expose

**Cons:**

- Visible in `docker inspect` output
- Unraid template would need to store it
- Still stored in plaintext, just different location

---

## Best Practices Summary

### ✅ DO:

1. **Restrict file permissions** on `/data` directory
2. **Keep on local network** only
3. **Use unique password** for Dungeon Revealer
4. **Use VPN** for remote access
5. **Regular backups** of your data directory
6. **Monitor access logs** in process.log

### ❌ DON'T:

1. **Don't expose** port 3002 to the internet
2. **Don't use** the same password for other services
3. **Don't share** the data directory publicly
4. **Don't commit** config.json to version control
5. **Don't access** over unencrypted networks (no public WiFi)

---

## Comparison to Similar Applications

Most self-hosted applications with API integration face this challenge:

| Application        | Password Storage                      |
| ------------------ | ------------------------------------- |
| **Plex**           | Encrypted tokens (after initial auth) |
| **Sonarr/Radarr**  | API keys in plaintext config          |
| **Home Assistant** | Tokens in plaintext config            |
| **This App**       | Password in plaintext config          |

The industry standard for self-hosted apps is plaintext credentials protected by:

- File system permissions
- Network isolation
- Physical server security

---

## For Maximum Security

If you require encrypted password storage, consider:

1. **Use a reverse proxy** with authentication (nginx, Traefik)
2. **Implement encryption** at rest for the entire `/data` volume
3. **Use Unraid's encryption** features for the share
4. **Network isolation** via VLAN segmentation

---

## Monitoring Access

Check who accessed the application:

```bash
# View access logs
docker logs DungeonRevealerManager

# View process log
cat /mnt/user/DungeonRevealer/dungeon-revealer-manager/process.log
```

---

## Questions?

The plaintext password storage is a **known limitation** based on:

- How Dungeon Revealer's API works (password-based auth)
- The need for automated server-side requests
- Standard practices in self-hosted applications

It's protected by standard file system security, which is appropriate for a **local network, self-hosted** application.

If you need higher security, consider the environment variable approach or implement a reverse proxy with additional authentication layers.
