#!/bin/bash
# Скрипт для тестирования Edge Functions локально

# Цвета для вывода
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Локальные credentials
LOCAL_URL="http://127.0.0.1:54321"
ANON_KEY="sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH"

echo -e "${BLUE}=== Тестирование Edge Functions локально ===${NC}\n"

# 1. Тест resend-webhook
echo -e "${GREEN}1. Тестируем resend-webhook${NC}"
curl -i --location --request POST "${LOCAL_URL}/functions/v1/resend-webhook" \
  --header "Authorization: Bearer ${ANON_KEY}" \
  --header "Content-Type: application/json" \
  --data '{
    "type": "email.sent",
    "created_at": "2024-01-01T00:00:00.000Z",
    "data": {
      "email_id": "test-123",
      "from": "test@example.com",
      "to": ["customer@test.com"],
      "subject": "Test Email"
    }
  }'

echo -e "\n\n"

# 2. Тест receive-email
echo -e "${GREEN}2. Тестируем receive-email${NC}"
curl -i --location --request POST "${LOCAL_URL}/functions/v1/receive-email" \
  --header "Authorization: Bearer ${ANON_KEY}" \
  --header "Content-Type: application/json" \
  --data '{
    "type": "email.received",
    "created_at": "2024-01-01T00:00:00.000Z",
    "data": {
      "email_id": "test-received-123",
      "from": "sender@example.com",
      "to": "alexchi@paumsel.resend.app",
      "subject": "Test Inbound Email"
    }
  }'

echo -e "\n\n"

# 3. Тест send-checkout-email
echo -e "${GREEN}3. Тестируем send-checkout-email${NC}"
curl -i --location --request POST "${LOCAL_URL}/functions/v1/send-checkout-email" \
  --header "Authorization: Bearer ${ANON_KEY}" \
  --header "Content-Type: application/json" \
  --data '{
    "customerName": "Test Customer",
    "customerEmail": "customer@test.com",
    "orderTotal": 238.00,
    "orderItems": [
      {
        "name": "Minimalist Cotton Tee",
        "quantity": 2,
        "price": 49
      }
    ]
  }'

echo -e "\n\n${BLUE}=== Тестирование завершено ===${NC}\n"

