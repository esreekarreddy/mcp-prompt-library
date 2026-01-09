# Sample Code Review

> Example of a thorough, constructive code review

---

# Code Review: Add User Profile Update Feature

**PR**: #142  
**Author**: @developer  
**Reviewer**: @reviewer  
**Files Changed**: 8  
**Lines**: +245 / -12

---

## Overview

This PR adds the ability for users to update their profile information (name, bio, avatar). Overall, the implementation is solid with good separation of concerns. A few security and UX improvements needed before merge.

---

## 🔴 Must Fix (Blocking)

### 1. Missing Authorization Check

**File**: `src/api/routes/users.ts:45`

```typescript
// Current code - anyone can update any profile
router.patch('/:id', validate(updateProfileSchema), async (req, res) => {
  const user = await userService.update(req.params.id, req.body);
  res.json(user);
});
```

**Problem**: No check that the authenticated user owns this profile. Any logged-in user could update any other user's profile.

**Suggested Fix**:
```typescript
router.patch('/:id', authenticate, validate(updateProfileSchema), async (req, res) => {
  // Check ownership
  if (req.params.id !== req.user.id) {
    throw new ForbiddenError('Cannot update other users\' profiles');
  }
  
  const user = await userService.update(req.params.id, req.body);
  res.json(user);
});
```

---

### 2. Avatar Upload Vulnerability

**File**: `src/services/upload.service.ts:23`

```typescript
// Current code - accepts any file type
async uploadAvatar(file: Express.Multer.File): Promise<string> {
  const key = `avatars/${uuid()}${path.extname(file.originalname)}`;
  await s3.upload({ Key: key, Body: file.buffer });
  return key;
}
```

**Problem**: No validation of file type. User could upload malicious files (SVG with scripts, HTML, executables).

**Suggested Fix**:
```typescript
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

async uploadAvatar(file: Express.Multer.File): Promise<string> {
  // Validate file type (check actual content, not just extension)
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    throw new ValidationError('Only JPEG, PNG, and WebP images allowed');
  }
  
  if (file.size > MAX_SIZE) {
    throw new ValidationError('Image must be under 5MB');
  }
  
  // Also validate magic bytes for extra security
  const fileType = await fileTypeFromBuffer(file.buffer);
  if (!fileType || !ALLOWED_TYPES.includes(fileType.mime)) {
    throw new ValidationError('Invalid image file');
  }
  
  const key = `avatars/${uuid()}.${fileType.ext}`;
  await s3.upload({ 
    Key: key, 
    Body: file.buffer,
    ContentType: fileType.mime 
  });
  return key;
}
```

---

## 🟡 Should Fix

### 3. Bio Length Not Validated on Backend

**File**: `src/schemas/user.schema.ts:12`

```typescript
// Frontend has limit, but backend doesn't
export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    bio: z.string().optional(), // No max length
  }),
});
```

**Suggestion**: Add max length to prevent abuse:
```typescript
bio: z.string().max(500).optional(),
```

---

### 4. Missing Loading State

**File**: `src/components/ProfileForm.tsx:34`

```tsx
// No loading feedback
<button type="submit">Save Changes</button>
```

**Suggestion**: Add loading state for better UX:
```tsx
<button type="submit" disabled={isPending}>
  {isPending ? 'Saving...' : 'Save Changes'}
</button>
```

---

### 5. Error Not Displayed to User

**File**: `src/components/ProfileForm.tsx:28`

```typescript
const onSubmit = async (data: FormData) => {
  try {
    await updateProfile(data);
    toast.success('Profile updated');
  } catch (error) {
    console.error(error); // Only logged, not shown
  }
};
```

**Suggestion**: Show error to user:
```typescript
} catch (error) {
  toast.error(error instanceof Error ? error.message : 'Failed to update profile');
}
```

---

## 🟢 Consider (Optional)

### 6. Could Extract Validation

**File**: `src/services/upload.service.ts`

The file validation logic is useful elsewhere. Consider extracting:

```typescript
// utils/file-validation.ts
export async function validateImageFile(
  file: Express.Multer.File,
  options: { maxSize?: number; allowedTypes?: string[] }
): Promise<FileType> {
  // Validation logic here
}
```

---

### 7. Test Coverage

Consider adding tests for:
- [ ] Profile update with valid data
- [ ] Profile update for wrong user (should fail)
- [ ] Avatar upload with invalid file type (should fail)
- [ ] Bio exceeding max length (should fail)

---

## 👍 What's Good

1. **Clean component structure** - The ProfileForm component is well-organized with clear separation of concerns.

2. **Good use of Zod** - Schema validation is properly structured and reusable.

3. **Proper error handling in service layer** - The userService correctly throws typed errors.

4. **Optimistic updates** - Nice use of React Query's optimistic updates for better UX.

5. **Accessible form** - Good use of labels and ARIA attributes.

---

## Questions

1. Should we delete the old avatar from S3 when a new one is uploaded? Currently old files will accumulate.

2. Is there a plan to add email change to profile settings? If so, we might want to structure this differently.

---

## Summary

| Category | Count |
|----------|-------|
| 🔴 Must Fix | 2 |
| 🟡 Should Fix | 3 |
| 🟢 Consider | 2 |
| 👍 Praise | 5 |

**Verdict**: Request changes. Please address the two blocking issues (auth check and file validation), then this is good to merge.

---

*This code review was structured using the Code Review skill from ai-library.*
