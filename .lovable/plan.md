

## Current Safeguard Status

Your chatbot currently has **minimal safeguards**:

- **Rate limiting** (429) and **credit exhaustion** (402) error handling from the AI gateway
- The underlying Gemini models have their own built-in content safety filters
- No custom input validation, content filtering, or abuse prevention on your side

## Plan: Add Comprehensive Safeguards

### 1. Input Validation & Sanitization (Edge Function)
- Add message length limits (e.g., max 4000 characters per message, max 20 messages in conversation history)
- Validate input structure (ensure messages array exists, roles are valid)
- Strip potentially malicious content

### 2. Content Safety System Prompt
- Add explicit safety instructions to the system prompt telling the AI to refuse harmful requests (violence, illegal activity, personal data generation, etc.)
- Add a moderation layer that checks both user input and AI output for blocked categories

### 3. Rate Limiting Per Client
- Track request counts using an in-memory map or database table
- Limit requests per IP/session (e.g., 30 requests per minute)

### 4. Prompt Injection Protection
- Add guardrails in the system prompt to resist jailbreak attempts
- Sanitize user messages to prevent system prompt override attempts

### 5. Image Upload Validation
- Validate file type and size on the client side (already partially done)
- Add server-side validation for base64 image size limits

### Technical Changes

| File | Change |
|------|--------|
| `supabase/functions/chat/index.ts` | Add input validation, length limits, safety system prompt, rate limiting |
| `supabase/functions/generate-image/index.ts` | Add prompt validation and length limits |
| `supabase/functions/generate-video/index.ts` | Add prompt validation and length limits |
| `src/components/ChatInput.tsx` | Add client-side message length limit with character counter |
| `src/hooks/use-chat.ts` | Cap conversation history length sent to API |

