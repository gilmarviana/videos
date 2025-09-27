# WhatsApp Integration System

## Overview

The WhatsApp Integration System provides a floating WhatsApp button with customizable menu options for the online course platform. This system allows administrators to configure WhatsApp contact options and provides users with an easy way to reach support through WhatsApp.

## Features

### Core Functionality
- **Floating WhatsApp Button**: Fixed position button that appears on all pages
- **Expandable Menu**: Menu with customizable options for different types of contact
- **Admin Configuration**: Complete admin interface for managing WhatsApp settings
- **Phone Number Validation**: Automatic formatting and validation of Brazilian phone numbers
- **Link Generation**: Automatic generation of WhatsApp links with pre-filled messages

### Admin Features
- Create and manage WhatsApp configurations
- Configure phone number and welcome message
- Add/edit/remove menu options with custom messages and icons
- Activate/deactivate WhatsApp integration
- Reorder menu options

### User Features
- Click floating button to open WhatsApp menu or direct message
- Select from predefined menu options
- Automatic redirection to WhatsApp with pre-filled messages

## Database Schema

### WhatsApp Configuration Table
```sql
CREATE TABLE whatsapp_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(20) NOT NULL,
    welcome_message TEXT NOT NULL,
    menu_options JSONB NOT NULL DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### Public Endpoints
- `GET /api/whatsapp/config` - Get active WhatsApp configuration
- `POST /api/whatsapp/link` - Generate WhatsApp link with message

### Admin Endpoints (Authentication Required)
- `POST /api/whatsapp/config` - Create new WhatsApp configuration
- `GET /api/whatsapp/config/[id]` - Get specific configuration
- `PUT /api/whatsapp/config/[id]` - Update configuration
- `DELETE /api/whatsapp/config/[id]` - Delete configuration

## Components

### WhatsAppFloatingButton
Main floating button component that appears on all pages.

```tsx
import { WhatsAppFloatingButton } from '@/components/whatsapp';

<WhatsAppFloatingButton />
```

### WhatsAppMenu
Expandable menu component with customizable options.

### WhatsAppConfiguration
Admin interface for managing WhatsApp settings.

```tsx
import { WhatsAppConfiguration } from '@/components/whatsapp';

<WhatsAppConfiguration />
```

## Services

### WhatsAppService
Main service class for WhatsApp functionality:

```typescript
import { whatsappService } from '@/lib/services/whatsapp.service';

// Get active configuration
const config = await whatsappService.getActiveConfig();

// Create configuration
const newConfig = await whatsappService.createConfig({
  phoneNumber: '5511999999999',
  welcomeMessage: 'Hello!',
  menuOptions: [...],
  isActive: true
});

// Generate WhatsApp link
const link = whatsappService.generateWhatsAppLink(phoneNumber, message);
```

## Usage

### Adding WhatsApp Button to Pages

Add the floating button to your layout or specific pages:

```tsx
import { WhatsAppFloatingButton } from '@/components/whatsapp';

export default function Layout({ children }) {
  return (
    <div>
      {children}
      <WhatsAppFloatingButton />
    </div>
  );
}
```

### Admin Configuration

1. Navigate to `/admin/whatsapp`
2. Configure phone number (include country code)
3. Set welcome message
4. Add menu options with titles, messages, and icons
5. Activate the configuration

### Menu Options Configuration

Each menu option includes:
- **Title**: Display name in the menu
- **Message**: Pre-filled message when option is selected
- **Icon**: Emoji or icon to display
- **Order**: Position in the menu

## Phone Number Format

The system automatically formats phone numbers:
- Brazilian numbers: Adds country code 55 if missing
- International format: 10-15 digits
- Validation ensures proper format before saving

## Validation Rules

### Phone Number
- Must be 10-15 digits
- Brazilian numbers automatically get country code 55
- Invalid formats are rejected

### Menu Options
- Maximum 10 options per configuration
- Title and message are required
- Titles must be unique
- Title max length: 50 characters
- Message max length: 500 characters

## Testing

Run WhatsApp system tests:

```bash
npm run test src/test/whatsapp-system.test.ts
```

Validate system functionality:

```bash
npx tsx src/scripts/validate-whatsapp-system.ts
```

## Error Handling

The system includes comprehensive error handling:
- Invalid phone number format
- Missing required fields
- Duplicate menu option titles
- Maximum options exceeded
- Configuration not found

## Security

- Admin authentication required for configuration management
- Input validation and sanitization
- SQL injection protection through parameterized queries
- XSS protection through proper encoding

## Integration with Landing Page

The WhatsApp button integrates seamlessly with the landing page system and appears on all public pages when activated.

## Customization

### Styling
The components use Tailwind CSS classes and can be customized by modifying the component styles.

### Positioning
The floating button position can be adjusted by modifying the CSS classes in the component.

### Icons
Menu options support emoji icons or custom icon fonts.

## Troubleshooting

### Button Not Appearing
1. Check if configuration exists and is active
2. Verify phone number format
3. Check browser console for errors

### Links Not Working
1. Verify phone number includes country code
2. Check message encoding
3. Ensure WhatsApp is installed on device

### Menu Not Opening
1. Check if menu options are configured
2. Verify JavaScript is enabled
3. Check for console errors

## Future Enhancements

Potential improvements for the WhatsApp system:
- Multiple phone numbers for different departments
- Scheduled availability (business hours)
- Integration with CRM systems
- Analytics tracking for WhatsApp interactions
- Custom button styling options
- Multi-language support for messages