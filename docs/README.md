# Dungeon Revealer Documentation# Dungeon Revealer Documentation

This folder contains all project documentation organized into focused, comprehensive files.Welcome to the Dungeon Revealer documentation. This folder contains comprehensive guides, deployment instructions, and development history.

## Documentation Files## Quick Navigation

| File | Description |### 🚀 Getting Started

|------|-------------|

| [ADMIN_PANEL.md](./ADMIN_PANEL.md) | Admin Panel features, usage, and visual design |- **[Quick Start Guide](guides/QUICK_START.md)** - Get up and running in 5 minutes

| [DEVELOPMENT.md](./DEVELOPMENT.md) | Development setup, architecture, and contribution guide |- **[Docker Deployment](deployment/DOCKER_GUIDE_UNRAID.md)** - Deploy to Unraid or Docker Desktop

| [DEPLOYMENT.md](./DEPLOYMENT.md) | Docker, Unraid, and production deployment instructions |

| [CHANGELOG.md](./CHANGELOG.md) | Version history and release notes |### 📚 Documentation

## Quick Links| Folder | Files | Contents |

| ---------------------------------- | ----- | -------------------------------------------------------- |

- **Main README**: See [../README.md](../README.md) for getting started| **[deployment/](deployment/)** | 5 | Docker setup, deployment guides, and troubleshooting |

- **Wiki**: https://github.com/dungeon-revealer/dungeon-revealer/wiki| **[guides/](guides/)** | 19 | Feature guides, testing guides, and quick references |

- **Discord**: https://discord.gg/dS5khqk| **[architecture/](architecture/)** | 27 | Design documents, roadmaps, and technical specifications |

| **[sessions/](sessions/)** | 29 | Complete development history across all sessions |

## Version

### 🎮 Features

Current: **v1.17.1** (December 2025)

#### Phase 1: Advanced Token Management ✅

- [Token HP Tracking](guides/QUICK_START.md#token-health-tracking)
- [Conditions System](guides/CONDITION_TOGGLE_TEST_GUIDE.md)
- [Initiative Tracker](guides/INITIATIVE_TRACKER_QUICK_START.md)
- [Armor Class Management](guides/QUICK_START.md#armor-class)

#### Phase 2: Enhanced Note System ✅

- [Note Templates](guides/TEMPLATE_APPEND_FEATURE_COMPLETE.md)
- [Template Append](guides/TEMPLATE_APPEND_FEATURE_COMPLETE.md)
- [Backlinks System](guides/INTEGRATION_GUIDE.md)
- [Category Management](guides/INTEGRATION_GUIDE.md)

### 🔧 Development

- **[Complete Session History](sessions/SESSION_HISTORY.md)** - All sessions from S5-S14 consolidated
- **[Enhancement Roadmap](architecture/CONSOLIDATED_ENHANCEMENT_PLAN.md)** - Future phases and planned features
- **[Workflow Rules](guides/WORKFLOW_RULES.md)** - Development guidelines and coding patterns
- **[Architecture Overview](architecture/RELEASE_v1.17.1.md)** - System design and technical details

### 🐛 Testing & Troubleshooting

- **[Testing Guide](guides/CONDITION_TOGGLE_TEST_GUIDE.md)** - How to test features
- **[Quick Test Scenarios](guides/QUICK_TEST_SCENARIO.md)** - Common test workflows
- **[Deployment Troubleshooting](deployment/DOCKER_GUIDE_UNRAID.md#troubleshooting)** - Docker and container issues

## Key Documentation Files

### Deployment

- `deployment/DOCKER_GUIDE_UNRAID.md` - Complete Docker and Unraid setup
- `deployment/DEPLOYMENT.md` - Deployment procedures
- `deployment/DEPLOYMENT_STATUS.md` - Current deployment status

### Guides

- `guides/QUICK_START.md` - Quick reference for common tasks
- `guides/INTEGRATION_GUIDE.md` - Integrating new features
- `guides/WORKFLOW_RULES.md` - Development workflow and conventions
- `guides/INITIATIVE_TRACKER_QUICK_START.md` - Initiative system overview
- `guides/CONDITION_TOGGLE_TEST_GUIDE.md` - Testing conditions

### Architecture

- `architecture/CONSOLIDATED_ENHANCEMENT_PLAN.md` - Roadmap and planned features
- `architecture/RELEASE_v1.17.1.md` - Latest release notes and features
- `architecture/PHASE_1_VERIFICATION_REPORT.md` - Phase 1 completion status
- `architecture/PHASE_2_QUICK_REFERENCE.md` - Phase 2 implementation guide

### Sessions

- `sessions/SESSION_HISTORY.md` - Consolidated history of all development sessions
- `sessions/SESSION_14_INITIATIVE_TRACKER_COMPLETE.md` - Latest session summary
- See `sessions/` folder for detailed per-session reports

## Project Structure

```
c:\Temp\git\dungeon-revealer\
├── src/                          # Frontend (React/TypeScript)
├── server/                        # Backend (Express/GraphQL)
├── docs/                          # 📁 Documentation (YOU ARE HERE)
│   ├── deployment/               # Docker and deployment guides
│   ├── guides/                   # Feature and testing guides
│   ├── architecture/             # Design and roadmap docs
│   ├── sessions/                 # Session history and reports
│   └── README.md                 # This file
├── README.md                      # Main project README
├── package.json                   # Dependencies
├── Dockerfile                     # Docker image definition
└── deploy.ps1                     # Deployment script
```

## Latest Status

**Current Version**: v1.17.1-phase2-hotfix  
**Last Updated**: November 26, 2025  
**Build Status**: ✅ Production Ready

### Recent Changes (Session 14)

- ✅ Fixed automatic token_data creation on token add
- ✅ Fixed MapIdContext import issue
- ✅ HP bars now render correctly
- ✅ Conditions display properly
- ✅ Initiative Tracker ready to use

## For New Contributors

1. Start with [Quick Start Guide](guides/QUICK_START.md)
2. Read [Workflow Rules](guides/WORKFLOW_RULES.md)
3. Review [Architecture Overview](architecture/RELEASE_v1.17.1.md)
4. Check [Session History](sessions/SESSION_HISTORY.md) for context
5. See [Copilot Instructions](./../.github/copilot-instructions.md) for AI-assisted development

## Support & Resources

- **GitHub**: https://github.com/Slippage23/dungeon-revealer
- **Issues**: Report on GitHub issue tracker
- **Documentation**: You're reading it!

---

**Need help?** Check the [Troubleshooting Guide](deployment/DOCKER_GUIDE_UNRAID.md#troubleshooting) or review [Session History](sessions/SESSION_HISTORY.md) for similar issues.
