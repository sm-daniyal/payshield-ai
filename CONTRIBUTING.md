# Contributing to PayShield AI

## Development Workflow

1. Ensure you are using Python 3.12+ and Node 20+.
2. Run the test suite before submitting any Pull Request:
   ```bash
   cd backend && pytest tests/ -q
   ```
3. **No Secrets:** Never commit `.env` files or real PayPal credentials. Use `.env.example` as a template.
4. **Tests Required:** Every PR that adds logic must include a corresponding test in the `tests/` directory.

## Commit Convention

We follow standard conventional commits:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `chore:` for maintenance and dependency updates
