# User Avatar Setup Instructions

## Overview
User avatar functionality has been added to allow image uploads when creating or updating user profiles. This helps differentiate users with similar names.

## Features Added
1. **Avatar upload field** in user creation and edit forms
2. **Image preview** during upload
3. **Avatar display** in user lists with fallback to initials
4. **Image validation** (JPEG, PNG, JPG, GIF, max 2MB)
5. **Automatic cleanup** when updating avatars

## Setup Required

### 1. Run Database Migration
```bash
php artisan migrate
```

### 2. Create Storage Symlink
```bash
php artisan storage:link
```

### 3. Ensure Permissions
Make sure the `storage/app/public/avatars` directory has proper write permissions.

## Files Modified
- `database/migrations/2025_07_31_000001_add_avatar_to_users_table.php` - New migration
- `app/Models/User.php` - Added avatar to fillable fields and avatar URL accessor
- `app/Http/Controllers/UserController.php` - Added image upload handling
- `resources/js/Pages/UserCreate.jsx` - Added avatar upload field with preview
- `resources/js/Pages/UserEdit.jsx` - Added avatar upload field with preview
- `resources/js/Pages/UsersList.jsx` - Added avatar display in table
- `resources/js/Components/Avatar.jsx` - New reusable avatar component
- `app/Providers/AppServiceProvider.php` - Ensures avatars directory exists

## Usage
1. When creating/editing a user, click "Choose File" under the Avatar field
2. Select an image file (JPEG, PNG, JPG, GIF, max 2MB)
3. Preview will appear below the file input
4. Submit the form to save the user with avatar
5. Avatar will display in the users list and forms

## Storage Structure
```
storage/
├── app/
│   └── public/
│       └── avatars/
│           └── [uploaded images]
└── ...

public/
└── storage/ -> symlink to storage/app/public/
```

## Notes
- Images are stored in `storage/app/public/avatars/`
- Old avatars are automatically deleted when updating
- Fallback shows user's initial if no avatar is uploaded
- Maximum file size: 2MB
- Supported formats: JPEG, PNG, JPG, GIF
