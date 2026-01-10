# Rust Coding Standards

> Conventions for Rust 1.83+ projects (January 2026)

## Toolchain Configuration

```toml
# rust-toolchain.toml
[toolchain]
channel = "stable"
components = ["rustfmt", "clippy", "rust-analyzer"]
```

## Clippy Configuration (Non-negotiable)

```toml
# Cargo.toml
[lints.rust]
unsafe_code = "forbid"

[lints.clippy]
all = { level = "warn", priority = -1 }
pedantic = { level = "warn", priority = -1 }
nursery = { level = "warn", priority = -1 }

# Must deny
unwrap_used = "deny"
expect_used = "deny"
panic = "deny"
todo = "deny"
unimplemented = "deny"

# Allow specific cases
module_name_repetitions = "allow"
must_use_exhaustive = "allow"
```

## Error Handling

### Use `thiserror` for Library Errors
```rust
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),
    
    #[error("Validation failed: {field} - {message}")]
    Validation { field: String, message: String },
    
    #[error("Not found: {0}")]
    NotFound(String),
    
    #[error("Unauthorized")]
    Unauthorized,
}
```

### Use `anyhow` for Application Errors
```rust
use anyhow::{Context, Result};

async fn load_config(path: &Path) -> Result<Config> {
    let content = fs::read_to_string(path)
        .with_context(|| format!("Failed to read config from {}", path.display()))?;
    
    let config: Config = toml::from_str(&content)
        .context("Failed to parse config TOML")?;
    
    Ok(config)
}
```

### Never Use `.unwrap()` or `.expect()` in Production
```rust
// ❌ Bad
let value = map.get("key").unwrap();

// ✅ Good - propagate with ?
let value = map.get("key").ok_or(AppError::NotFound("key".into()))?;

// ✅ Good - provide default
let value = map.get("key").unwrap_or(&default);

// ✅ Good - pattern match
if let Some(value) = map.get("key") {
    // use value
}
```

## Struct Design

### Builder Pattern for Complex Structs
```rust
#[derive(Debug, Clone)]
pub struct Client {
    base_url: Url,
    timeout: Duration,
    max_retries: u32,
    headers: HeaderMap,
}

impl Client {
    pub fn builder(base_url: impl Into<Url>) -> ClientBuilder {
        ClientBuilder::new(base_url.into())
    }
}

#[derive(Debug, Default)]
pub struct ClientBuilder {
    base_url: Url,
    timeout: Option<Duration>,
    max_retries: Option<u32>,
    headers: HeaderMap,
}

impl ClientBuilder {
    pub fn timeout(mut self, timeout: Duration) -> Self {
        self.timeout = Some(timeout);
        self
    }
    
    pub fn max_retries(mut self, retries: u32) -> Self {
        self.max_retries = Some(retries);
        self
    }
    
    pub fn build(self) -> Client {
        Client {
            base_url: self.base_url,
            timeout: self.timeout.unwrap_or(Duration::from_secs(30)),
            max_retries: self.max_retries.unwrap_or(3),
            headers: self.headers,
        }
    }
}
```

### Derive Common Traits
```rust
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct UserId(String);

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct User {
    pub id: UserId,
    pub email: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
}
```

## Async Patterns

### Use `tokio` as Runtime
```rust
#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::init();
    
    let app = create_app().await?;
    let listener = TcpListener::bind("0.0.0.0:3000").await?;
    
    axum::serve(listener, app).await?;
    Ok(())
}
```

### Structured Concurrency with `tokio::select!`
```rust
tokio::select! {
    result = server.run() => {
        tracing::error!(?result, "Server exited");
    }
    _ = shutdown_signal() => {
        tracing::info!("Shutdown signal received");
    }
}
```

### Use `futures::stream` for Batch Processing
```rust
use futures::{stream, StreamExt};

let results: Vec<Result<Response>> = stream::iter(urls)
    .map(|url| async move { fetch(url).await })
    .buffer_unordered(10)
    .collect()
    .await;
```

## API Design

### Accept `impl Into<T>` for Flexibility
```rust
pub fn new(name: impl Into<String>) -> Self {
    Self { name: name.into() }
}

// Allows both:
Thing::new("literal");
Thing::new(owned_string);
```

### Return `impl Trait` for Opaque Types
```rust
pub fn iter_users(&self) -> impl Iterator<Item = &User> {
    self.users.values()
}
```

### Use Newtypes for Type Safety
```rust
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct UserId(pub String);

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct TeamId(pub String);

// Now impossible to mix up user and team IDs
fn get_user(id: UserId) -> Option<User> { ... }
fn get_team(id: TeamId) -> Option<Team> { ... }
```

## Testing

### Use `#[test]` and `#[tokio::test]`
```rust
#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn user_id_equality() {
        let id1 = UserId("123".into());
        let id2 = UserId("123".into());
        assert_eq!(id1, id2);
    }
    
    #[tokio::test]
    async fn fetch_user_success() {
        let client = Client::builder("http://localhost").build();
        let user = client.get_user(UserId("1".into())).await.unwrap();
        assert_eq!(user.id.0, "1");
    }
}
```

### Use `proptest` for Property Testing
```rust
use proptest::prelude::*;

proptest! {
    #[test]
    fn parse_serialize_roundtrip(s in "[a-z]{1,10}") {
        let parsed: MyType = s.parse().unwrap();
        let serialized = parsed.to_string();
        assert_eq!(s, serialized);
    }
}
```

## Documentation

### Document Public API with Examples
```rust
/// Creates a new client with the given base URL.
///
/// # Examples
///
/// ```
/// use mylib::Client;
///
/// let client = Client::new("https://api.example.com");
/// ```
///
/// # Panics
///
/// Panics if the URL is invalid (use `Client::try_new` for fallible construction).
pub fn new(base_url: &str) -> Self { ... }
```

## Memory Safety

### Prefer `Arc` + `Mutex` for Shared State
```rust
use std::sync::Arc;
use tokio::sync::Mutex;

#[derive(Clone)]
pub struct AppState {
    db: Arc<Pool>,
    cache: Arc<Mutex<HashMap<String, Value>>>,
}
```

### Use `Cow` for Flexible Ownership
```rust
use std::borrow::Cow;

fn process(input: Cow<'_, str>) -> String {
    if needs_modification(&input) {
        let mut owned = input.into_owned();
        modify(&mut owned);
        owned
    } else {
        input.into_owned()
    }
}
```

## Pairs Well With

- `contexts/patterns/rust-error-handling.md`
- `skills/rust-debugging.md`
- `prompts/development/rust-optimizer.md`
