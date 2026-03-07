# 🤝 Contributing to Coupon Hub

Thank you for your interest in contributing to Coupon Hub!

## Development Setup

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15+ (for local development)
- Git

### Local Development

#### Backend Development

```bash
cd backend
npm install

# Set up environment
cp .env.example .env
# Edit .env with your local database URL

# Run migrations
npm run migrate

# Start development server (with hot reload)
npm run dev
```

The backend will run on http://localhost:3000

#### Frontend Development

```bash
cd frontend
npm install

# Set up environment
cp .env.example .env
# Edit .env with your API URL

# Start development server
npm run dev
```

The frontend will run on http://localhost:5173

### Code Style

- **TypeScript**: Strict mode enabled
- **Naming**: camelCase for variables/functions, PascalCase for classes/interfaces
- **Async/Await**: Preferred over promises
- **Error Handling**: Use custom error classes
- **Comments**: Explain "why", not "what"

### Project Structure

```
backend/src/
├── controllers/    # HTTP request handlers
├── services/       # Business logic
├── repositories/   # Database operations
├── models/         # TypeScript interfaces
├── middleware/     # Request processing
├── routes/         # API route definitions
├── config/         # Configuration
└── utils/          # Utilities

frontend/src/
├── components/     # Reusable React components
├── pages/          # Page components
├── services/       # API client
└── App.tsx         # Main application
```

### Making Changes

1. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, readable code
   - Add comments for complex logic
   - Update types as needed

3. **Test your changes**
   ```bash
   # Run the test script
   ./test-api.sh
   
   # Manual testing via UI
   docker-compose up --build
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Commit Message Convention

Use conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

Examples:
```
feat: add pagination to product list
fix: resolve race condition in purchase flow
docs: update API documentation
refactor: extract pricing logic to service
```

### Adding New Features

#### Adding a New API Endpoint

1. **Define the model** (if needed) in `backend/src/models/`
2. **Create repository method** in `backend/src/repositories/`
3. **Add service logic** in `backend/src/services/`
4. **Create controller** in `backend/src/controllers/`
5. **Add route** in `backend/src/routes/`
6. **Add validation** in `backend/src/utils/validators.ts`
7. **Update documentation** in `API_DOCUMENTATION.md`

#### Adding a New Frontend Component

1. **Create component** in `frontend/src/components/`
2. **Add styles** (co-located CSS file)
3. **Update parent component** to use new component
4. **Test in browser**

### Database Changes

If you need to modify the database schema:

1. **Create a new migration file**
   ```sql
   -- migrations/002_your_change.sql
   ALTER TABLE products ADD COLUMN new_field VARCHAR(255);
   ```

2. **Update TypeScript models** to match schema

3. **Update repositories** to handle new fields

4. **Test migration**
   ```bash
   docker-compose down -v
   docker-compose up --build
   ```

### Testing

#### Manual Testing Checklist

- [ ] Admin can create products
- [ ] Pricing calculation is correct
- [ ] Customer can browse products
- [ ] Customer can purchase products
- [ ] Reseller API requires authentication
- [ ] Reseller price validation works
- [ ] Error messages are clear
- [ ] UI is responsive

#### Automated Testing

Run the test script:
```bash
chmod +x test-api.sh
./test-api.sh
```

### Code Review Guidelines

When reviewing PRs, check for:

- ✅ Code follows project structure
- ✅ TypeScript types are properly defined
- ✅ Error handling is implemented
- ✅ No hardcoded secrets or credentials
- ✅ Documentation is updated
- ✅ Tests pass
- ✅ No console.log statements (use proper logging)

### Common Issues

#### Port Already in Use
```bash
# Find process using port
lsof -i :3000
# Kill it
kill -9 <PID>
```

#### Database Connection Error
```bash
# Reset database
docker-compose down -v
docker-compose up --build
```

#### TypeScript Errors
```bash
# Rebuild
cd backend
npm run build
```

### Getting Help

- Check existing documentation
- Review similar code in the project
- Ask questions in issues/discussions

### License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing! 🎉
