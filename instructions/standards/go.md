# Go Coding Standards

> Conventions for Go 1.23+ projects (January 2026)

## Project Structure

```
myapp/
├── cmd/
│   └── myapp/
│       └── main.go          # Entry point
├── internal/                 # Private packages
│   ├── config/
│   ├── handler/
│   ├── service/
│   └── repository/
├── pkg/                      # Public packages (if any)
├── api/                      # OpenAPI specs, protobuf
├── go.mod
└── go.sum
```

## Go Module Configuration

```go
// go.mod
module github.com/org/myapp

go 1.23

require (
    github.com/go-chi/chi/v5 v5.0.0
    github.com/jackc/pgx/v5 v5.5.0
)
```

## Error Handling

### Wrap Errors with Context
```go
import "fmt"

func LoadConfig(path string) (*Config, error) {
    data, err := os.ReadFile(path)
    if err != nil {
        return nil, fmt.Errorf("load config from %s: %w", path, err)
    }
    
    var cfg Config
    if err := json.Unmarshal(data, &cfg); err != nil {
        return nil, fmt.Errorf("parse config: %w", err)
    }
    
    return &cfg, nil
}
```

### Define Custom Error Types for Matching
```go
var (
    ErrNotFound    = errors.New("not found")
    ErrUnauthorized = errors.New("unauthorized")
    ErrValidation  = errors.New("validation failed")
)

type ValidationError struct {
    Field   string
    Message string
}

func (e *ValidationError) Error() string {
    return fmt.Sprintf("%s: %s", e.Field, e.Message)
}

func (e *ValidationError) Is(target error) bool {
    return target == ErrValidation
}
```

### Check Errors with `errors.Is` and `errors.As`
```go
if errors.Is(err, ErrNotFound) {
    // handle not found
}

var validErr *ValidationError
if errors.As(err, &validErr) {
    // handle validation error with field info
}
```

## Struct Design

### Use Functional Options Pattern
```go
type Server struct {
    addr         string
    readTimeout  time.Duration
    writeTimeout time.Duration
    logger       *slog.Logger
}

type Option func(*Server)

func WithReadTimeout(d time.Duration) Option {
    return func(s *Server) {
        s.readTimeout = d
    }
}

func WithLogger(l *slog.Logger) Option {
    return func(s *Server) {
        s.logger = l
    }
}

func NewServer(addr string, opts ...Option) *Server {
    s := &Server{
        addr:         addr,
        readTimeout:  30 * time.Second,
        writeTimeout: 30 * time.Second,
        logger:       slog.Default(),
    }
    for _, opt := range opts {
        opt(s)
    }
    return s
}

// Usage
srv := NewServer(":8080",
    WithReadTimeout(10*time.Second),
    WithLogger(myLogger),
)
```

### Embed Interfaces for Composition
```go
type Reader interface {
    Read(ctx context.Context, id string) (*Entity, error)
}

type Writer interface {
    Write(ctx context.Context, e *Entity) error
}

type ReadWriter interface {
    Reader
    Writer
}
```

## Context Usage

### Always Accept `context.Context` as First Parameter
```go
func (s *Service) GetUser(ctx context.Context, id string) (*User, error) {
    user, err := s.repo.Find(ctx, id)
    if err != nil {
        return nil, fmt.Errorf("get user %s: %w", id, err)
    }
    return user, nil
}
```

### Use Context for Cancellation and Timeouts
```go
ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
defer cancel()

result, err := client.Fetch(ctx, url)
if errors.Is(err, context.DeadlineExceeded) {
    return nil, fmt.Errorf("request timed out")
}
```

## Concurrency

### Use `errgroup` for Parallel Operations
```go
import "golang.org/x/sync/errgroup"

func FetchAll(ctx context.Context, urls []string) ([]Response, error) {
    g, ctx := errgroup.WithContext(ctx)
    results := make([]Response, len(urls))
    
    for i, url := range urls {
        g.Go(func() error {
            resp, err := fetch(ctx, url)
            if err != nil {
                return err
            }
            results[i] = resp
            return nil
        })
    }
    
    if err := g.Wait(); err != nil {
        return nil, err
    }
    return results, nil
}
```

### Use Channels for Communication
```go
func worker(ctx context.Context, jobs <-chan Job, results chan<- Result) {
    for {
        select {
        case <-ctx.Done():
            return
        case job, ok := <-jobs:
            if !ok {
                return
            }
            results <- process(job)
        }
    }
}
```

## Logging with `slog` (Go 1.21+)

### Structured Logging
```go
import "log/slog"

logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
    Level: slog.LevelInfo,
}))

logger.Info("request processed",
    slog.String("method", r.Method),
    slog.String("path", r.URL.Path),
    slog.Duration("latency", latency),
    slog.Int("status", status),
)
```

### Add Context to Logger
```go
logger = logger.With(
    slog.String("service", "api"),
    slog.String("version", version),
)
```

## Testing

### Table-Driven Tests
```go
func TestAdd(t *testing.T) {
    tests := []struct {
        name     string
        a, b     int
        expected int
    }{
        {"positive", 1, 2, 3},
        {"negative", -1, -2, -3},
        {"zero", 0, 0, 0},
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            result := Add(tt.a, tt.b)
            if result != tt.expected {
                t.Errorf("Add(%d, %d) = %d; want %d", 
                    tt.a, tt.b, result, tt.expected)
            }
        })
    }
}
```

### Use `testify` for Assertions
```go
import (
    "testing"
    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/require"
)

func TestUser(t *testing.T) {
    user, err := GetUser(ctx, "123")
    require.NoError(t, err)
    
    assert.Equal(t, "123", user.ID)
    assert.NotEmpty(t, user.Email)
}
```

### Mock with Interfaces
```go
type UserRepository interface {
    Find(ctx context.Context, id string) (*User, error)
}

type mockUserRepo struct {
    user *User
    err  error
}

func (m *mockUserRepo) Find(ctx context.Context, id string) (*User, error) {
    return m.user, m.err
}

func TestService(t *testing.T) {
    repo := &mockUserRepo{user: &User{ID: "123"}}
    svc := NewService(repo)
    
    user, err := svc.GetUser(ctx, "123")
    require.NoError(t, err)
    assert.Equal(t, "123", user.ID)
}
```

## API Design

### Accept Interfaces, Return Structs
```go
// ✅ Good - accepts interface
func Process(r io.Reader) error { ... }

// ✅ Good - returns concrete type
func NewClient() *Client { ... }
```

### Use `any` Instead of `interface{}`
```go
// Go 1.18+
func Print(v any) {
    fmt.Println(v)
}
```

### Generic Functions (Go 1.18+)
```go
func Map[T, U any](items []T, fn func(T) U) []U {
    result := make([]U, len(items))
    for i, item := range items {
        result[i] = fn(item)
    }
    return result
}

// Usage
names := Map(users, func(u User) string { return u.Name })
```

## HTTP Handlers

### Use `chi` or Standard Library Mux
```go
import "github.com/go-chi/chi/v5"

func NewRouter(svc *Service) http.Handler {
    r := chi.NewRouter()
    
    r.Use(middleware.Logger)
    r.Use(middleware.Recoverer)
    
    r.Route("/api/v1", func(r chi.Router) {
        r.Get("/users/{id}", handleGetUser(svc))
        r.Post("/users", handleCreateUser(svc))
    })
    
    return r
}

func handleGetUser(svc *Service) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        id := chi.URLParam(r, "id")
        
        user, err := svc.GetUser(r.Context(), id)
        if errors.Is(err, ErrNotFound) {
            http.Error(w, "not found", http.StatusNotFound)
            return
        }
        if err != nil {
            http.Error(w, "internal error", http.StatusInternalServerError)
            return
        }
        
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(user)
    }
}
```

## Linting

### Use `golangci-lint`
```yaml
# .golangci.yml
run:
  timeout: 5m

linters:
  enable:
    - errcheck
    - gosimple
    - govet
    - ineffassign
    - staticcheck
    - unused
    - gofmt
    - goimports
    - misspell
    - unconvert
    - unparam
    - gocritic
    - revive

linters-settings:
  revive:
    rules:
      - name: exported
        arguments:
          - checkPrivateReceivers
          - sayRepetitiveInsteadOfStutters
```

## Pairs Well With

- `contexts/patterns/go-project-layout.md`
- `skills/go-debugging.md`
- `prompts/development/go-optimizer.md`
