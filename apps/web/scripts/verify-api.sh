#!/usr/bin/env bash
# =============================================================================
# verify-api.sh — Verificación de integridad del build de Galaxy Online III
#
# Uso:
#   chmod +x apps/web/scripts/verify-api.sh
#   ./apps/web/scripts/verify-api.sh
#
# Este script comprueba:
#   1. Existencia de archivos fuente (API Routes, lib, seed)
#   2. Existencia de helpers compartidos (Prisma, auth, sync)
#   3. Dependencias críticas en package.json
#   4. Archivos del backend (seedService, authService)
#   5. Esquema de Prisma y seed global
# =============================================================================

set -euo pipefail

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Contadores
PASS=0
FAIL=0
WARN=0

# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

pass() {
  printf "  ${GREEN}✅${NC} %s\n" "$1"
  ((PASS++)) || true
}

fail() {
  printf "  ${RED}❌${NC} %s\n" "$1"
  ((FAIL++)) || true
}

warn() {
  printf "  ${YELLOW}⚠️${NC} %s\n" "$1"
  ((WARN++)) || true
}

header() {
  printf "\n${BOLD}${BLUE}%s${NC}\n" "$1"
}

# ─────────────────────────────────────────────────────────────────────────────
# 1. Archivos fuente de la app web
# ─────────────────────────────────────────────────────────────────────────────

header "1. Archivos fuente — App Web (@galaxy/web)"

WEB_BASE="${1:-./apps/web}"

check_file() {
  local filepath="$1"
  local label="${2:-$filepath}"
  if [ -f "$filepath" ]; then
    pass "$label"
  else
    fail "$label"
  fi
}

check_file "$WEB_BASE/src/lib/prisma.ts"           "prisma.ts        (Prisma client wrapper)"
check_file "$WEB_BASE/src/lib/seed.ts"             "seed.ts          (Seed de datos iniciales)"
check_file "$WEB_BASE/src/lib/apiBase.ts"          "apiBase.ts       (Base URL de la API)"
check_file "$WEB_BASE/scripts/verify-api.sh"       "verify-api.sh    (este script)"

# ─────────────────────────────────────────────────────────────────────────────
# 2. Archivos del backend
# ─────────────────────────────────────────────────────────────────────────────

header "2. Archivos fuente — Backend (Express API)"

BACKEND_BASE="${2:-./backend}"

check_file "$BACKEND_BASE/src/services/seedService.ts"   "seedService.ts   (Servicio de seed Prisma)"
check_file "$BACKEND_BASE/src/services/authService.ts"   "authService.ts   (Servicio de autenticación)"
check_file "$BACKEND_BASE/src/routes/auth.ts"            "auth.ts          (Routes de auth + integración seed)"
check_file "$BACKEND_BASE/src/routes/battles.ts"         "battles.ts       (Sistema de combate)"
check_file "$BACKEND_BASE/src/routes/economy.ts"         "economy.ts       (Economía y recursos)"

# ─────────────────────────────────────────────────────────────────────────────
# 3. Archivos compartidos (packages)
# ─────────────────────────────────────────────────────────────────────────────

header "3. Archivos compartidos — Packages"

DB_BASE="${3:-./packages/database}"

check_file "$DB_BASE/prisma/schema.prisma"       "schema.prisma    (Modelos Prisma)"
check_file "$DB_BASE/prisma/seed.ts"             "seed.ts global   (Seed blueprints + misiones)"
check_file "$DB_BASE/src/index.ts"               "index.ts         (Export Prisma client)"

# Verificar que el schema tiene los modelos clave
header "3b. Modelos en schema.prisma"

for model in User Empire Resource Planet Building Blueprint Ship Fleet Mission MissionRun Battle; do
  if grep -q "model $model " "$DB_BASE/prisma/schema.prisma" 2>/dev/null; then
    pass "Modelo $model"
  else
    fail "Modelo $model"
  fi
done

# ─────────────────────────────────────────────────────────────────────────────
# 4. Dependencias críticas
# ─────────────────────────────────────────────────────────────────────────────

header "4. Dependencias npm — App Web"

if [ -f "$WEB_BASE/package.json" ]; then
  grep -q '"@galaxy/shared"'           "$WEB_BASE/package.json" && pass "@galaxy/shared"           || fail "@galaxy/shared"
  grep -q '"@galaxy/database"'         "$WEB_BASE/package.json" && pass "@galaxy/database"         || warn "@galaxy/database (no declarado — puede resolver via workspaces)"
  grep -q '"next"'                     "$WEB_BASE/package.json" && pass "next"                     || fail "next"
  grep -q '"typescript"'               "$WEB_BASE/package.json" && pass "typescript"               || fail "typescript"
else
  fail "$WEB_BASE/package.json no encontrado"
fi

header "4b. Dependencias npm — Backend"

if [ -f "$BACKEND_BASE/package.json" ]; then
  grep -q '"@galaxy/database"'         "$BACKEND_BASE/package.json" && pass "@galaxy/database"         || fail "@galaxy/database"
  grep -q '"@prisma/client"'           "$BACKEND_BASE/package.json" && pass "@prisma/client"           || fail "@prisma/client"
  grep -q '"express"'                  "$BACKEND_BASE/package.json" && pass "express"                  || fail "express"
  grep -q '"jsonwebtoken"'             "$BACKEND_BASE/package.json" && pass "jsonwebtoken"             || fail "jsonwebtoken"
  grep -q '"bcryptjs"'                 "$BACKEND_BASE/package.json" && pass "bcryptjs"                 || fail "bcryptjs"
  grep -q '"pg"'                       "$BACKEND_BASE/package.json" && pass "pg (PostgreSQL)"          || fail "pg (PostgreSQL)"
else
  fail "$BACKEND_BASE/package.json no encontrado"
fi

header "4c. Dependencias npm — Database Package"

if [ -f "$DB_BASE/package.json" ]; then
  grep -q '"@prisma/client"'           "$DB_BASE/package.json" && pass "@prisma/client"           || fail "@prisma/client"
  grep -q '"prisma"'                   "$DB_BASE/package.json" && pass "prisma (dev)"             || fail "prisma (dev)"
else
  fail "$DB_BASE/package.json no encontrado"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 5. Configuración TypeScript
# ─────────────────────────────────────────────────────────────────────────────

header "5. Configuración TypeScript"

check_file "$WEB_BASE/tsconfig.json"       "tsconfig.json — Web"
check_file "$BACKEND_BASE/tsconfig.json"   "tsconfig.json — Backend"
check_file "$DB_BASE/tsconfig.json"        "tsconfig.json — Database"

# Verificar strict mode en la app web
if [ -f "$WEB_BASE/tsconfig.json" ] && grep -q '"strict": true' "$WEB_BASE/tsconfig.json"; then
  pass "strict: true — App Web"
else
  warn "strict: true no encontrado — App Web"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 6. Verificación de imports cruzados (build integrity)
# ─────────────────────────────────────────────────────────────────────────────

header "6. Integridad de imports cruzados"

# Verificar que seed.ts importa de ./prisma
if grep -q "from './prisma'" "$WEB_BASE/src/lib/seed.ts" 2>/dev/null; then
  pass "seed.ts → prisma.ts"
else
  fail "seed.ts → prisma.ts (import no encontrado)"
fi

# Verificar que seedService importa de @galaxy/database
if grep -q "from '@galaxy/database'" "$BACKEND_BASE/src/services/seedService.ts" 2>/dev/null; then
  pass "seedService.ts → @galaxy/database"
else
  fail "seedService.ts → @galaxy/database (import no encontrado)"
fi

# Verificar que authService importa seedService
if grep -q "from '@/services/seedService'" "$BACKEND_BASE/src/services/authService.ts" 2>/dev/null; then
  pass "authService.ts → seedService.ts"
else
  fail "authService.ts → seedService.ts (import no encontrado)"
fi

# Verificar la llamada a seedService.initializeNewUser en authService
if grep -q "seedService.initializeNewUser" "$BACKEND_BASE/src/services/authService.ts" 2>/dev/null; then
  pass "authService.register() → seedService.initializeNewUser()"
else
  fail "authService.register() no llama a seedService.initializeNewUser()"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 7. Resumen
# ─────────────────────────────────────────────────────────────────────────────

header "═════════════════════════════════════════"
header "RESUMEN DE VERIFICACIÓN"
header "═════════════════════════════════════════"

printf "  ${GREEN}Pasaron:${NC}  %d\n" "$PASS"
printf "  ${RED}Fallaron:${NC} %d\n" "$FAIL"
printf "  ${YELLOW}Warnings:${NC} %d\n" "$WARN"

if [ "$FAIL" -eq 0 ]; then
  printf "\n${GREEN}${BOLD}✅ VERIFICACIÓN COMPLETADA — Build íntegro${NC}\n\n"
  exit 0
else
  printf "\n${RED}${BOLD}❌ VERIFICACIÓN CON ERRORES — Revisar fallos arriba${NC}\n\n"
  exit 1
fi
