# 🎯 Docker Image Tagging - Clarification

## ✅ You Are Correct!

When you pull `slippage/dungeon-revealer`, Docker defaults to `:latest` tag:

```bash
# These are equivalent:
docker pull slippage/dungeon-revealer
docker pull slippage/dungeon-revealer:latest
```

Both pull the **most recent version** on Docker Hub.

---

## 📊 Image Tags Explained

| Tag               | What                      | When Updated               |
| ----------------- | ------------------------- | -------------------------- |
| `:latest`         | Always the newest version | Every build/push           |
| `:v1.17.1-phase2` | Specific frozen release   | Never (historic reference) |

---

## ✅ What's Correct for Production

**Use**: `slippage/dungeon-revealer:latest`

This automatically:

- ✅ Gets the newest code
- ✅ Gets both the templates fix AND Initiative Tracker
- ✅ Updates automatically when you pull
- ✅ Handles future updates seamlessly

**Avoid**: `:v1.17.1-phase2` (this is old, doesn't have the hotfix)

---

## 🚀 Updated Commands

### In Unraid, use:

```bash
docker pull slippage/dungeon-revealer:latest
```

Or just:

```bash
docker pull slippage/dungeon-revealer
```

### In deploy.ps1:

We tag both:

```powershell
docker build -t slippage/dungeon-revealer:latest `
    -t slippage/dungeon-revealer:1.17.1-phase2-hotfix `
    .
```

Then push:

```bash
docker push slippage/dungeon-revealer:latest
docker push slippage/dungeon-revealer:1.17.1-phase2-hotfix
```

---

## 📝 Updated Documentation

✅ All files have been updated to use `:latest`:

- `DOCKER_GUIDE_UNRAID.md` - Now recommends `:latest`
- `deploy.ps1` - Tags and pushes `:latest`
- Unraid XML template - Uses `:latest`

---

## Summary

Yes, you're correct! `:latest` is the right approach for production. It ensures:

1. **Always get newest fixes** (like the templates fix we just made)
2. **Always get new features** (like Initiative Tracker)
3. **Automatic updates** when you rebuild and push
4. **No manual tag management** needed

So your Unraid deployment is good to go. When you run `deploy.ps1`:

- ✅ Builds with latest code
- ✅ Tags as `:latest`
- ✅ Pushes to Docker Hub
- ✅ You pull `:latest` in Unraid
- ✅ You get everything! 🎉
