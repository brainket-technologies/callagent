# Password Security & Cryptographic Hashing Rule

## Mandatory Policy: Never Store or Compare Plain-Text Passwords

1. **Hashing is Mandatory:**
   - Har password (chahe admin ho, user ho, ya API token) **hamesha cryptographically hashed format (`bcrypt` with salt, min 10 rounds)** mein hi database mein store hoga.
   - Plain-text passwords database (`password_hash`, `password`, ya kisi bhi column) mein store karna **strictly prohibited** hai.

2. **Authentication & Comparison:**
   - Login / verification ke waqt user ke entered password ko plain-text compare (`password === dbPassword`) kabhi nahi karna.
   - Hamesha `verifyPassword` (`bcrypt.compare`) use karna hai constant-time secure verification ke liye.

3. **Seeding, Fixtures & Testing:**
   - Seed scripts (`seed.ts`), mock data, ya testing scripts mein bhi dummy credentials create karte waqt `hashPassword()` function ka use karke hash format mein hi database mein insert karna hai.

4. **Shared Utility:**
   - Hamesha centralized utility `src/lib/auth-password.ts` (`hashPassword`, `verifyPassword`) ka use karein taaki salt rounds aur algorithm pure codebase mein consistent rahein.
