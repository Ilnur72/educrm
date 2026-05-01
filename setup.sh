#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#  EduCRM — Yangi klient uchun setup skripti
# ═══════════════════════════════════════════════════════════════

set -e

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  EduCRM — Yangi klient sozlamalari"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ─── Kirish ma'lumotlari ───────────────────────────────────────
read -p "📌 Tizim nomi (masalan: BrainAcademy CRM): " APP_NAME
read -p "🌐 Server URL (masalan: http://84.54.118.39:3000): " SERVER_URL
read -p "🗄️  PostgreSQL DATABASE_URL: " DATABASE_URL
read -p "🤖 Telegram Bot Token: " BOT_TOKEN
read -p "💬 Telegram Admin Chat ID: " CHAT_ID
read -p "🤖 Telegram Bot Username (@ siz): " BOT_USERNAME

# ─── NEXTAUTH_SECRET generatsiya ──────────────────────────────
SECRET=$(openssl rand -base64 32)

# ─── .env fayl yaratish ────────────────────────────────────────
cat > .env << EOF
DATABASE_URL="${DATABASE_URL}"

NEXTAUTH_SECRET="${SECRET}"
NEXTAUTH_URL="${SERVER_URL}"

NEXT_PUBLIC_APP_NAME="${APP_NAME}"
NEXT_PUBLIC_APP_TAGLINE="O'quv markaz boshqaruv tizimi"

SMS_LOGIN="your-eskiz-login"
SMS_PASSWORD="your-eskiz-password"
SMS_SENDER="${APP_NAME}"

TELEGRAM_BOT_TOKEN="${BOT_TOKEN}"
TELEGRAM_WEBHOOK_SECRET="$(openssl rand -hex 16)"
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME="${BOT_USERNAME}"
TELEGRAM_ADMIN_CHAT_ID="${CHAT_ID}"

CRON_SECRET="$(openssl rand -hex 16)"
EOF

echo ""
echo "✅ .env fayl yaratildi"

# ─── Dependencies ──────────────────────────────────────────────
echo "📦 Paketlar o'rnatilmoqda..."
npm install

# ─── Database ─────────────────────────────────────────────────
echo "🗄️  Database schema yaratilmoqda..."
npx prisma db push

# ─── Seed ─────────────────────────────────────────────────────
read -p "🌱 Demo ma'lumotlar kiritilsinmi? (y/n): " SEED
if [ "$SEED" = "y" ]; then
  npm run db:seed
fi

# ─── Build ────────────────────────────────────────────────────
echo "🔨 Build qilinmoqda..."
npm run build

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ Setup yakunlandi!"
echo ""
echo "  Ishga tushirish:"
echo "  pm2 start npm --name \"educrm\" -- start"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
