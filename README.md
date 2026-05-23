# Galaxy Online III

**Un juego de estrategia espacial 4X inspirado en los clásicos del género.**

---

## ⚠️ Aviso Legal

Este proyecto es una **obra original** inspirada en el género de estrategia espacial 4X, con referencia a la experiencia de juegos como Galaxy Online II, Stellaris, OGame, y otros títulos del género.

- **No está afiliado** con IGG, Galaxy Online II, SuperGO2, ni ningún proyecto relacionado.
- **No es** un clon, emulador, servidor privado, o continuación de GO2.
- **Es** un juego independiente con mecánicas propias, arte original, y universo único.

Ver [docs/research/legal-safety.md](docs/research/legal-safety.md) para más detalles.

---

## 📚 Documentación

| Documento | Descripción |
|-----------|-------------|
| [docs/research/README.md](docs/research/README.md) | Contexto histórico de GO2 y objetivos |
| [docs/research/sources.md](docs/research/sources.md) | Fuentes de investigación evaluadas |
| [docs/research/game-systems.md](docs/research/game-systems.md) | Sistemas de juego documentados (15+) |
| [docs/research/data-model.md](docs/research/data-model.md) | Esquema de entidades con SQL |
| [docs/research/combat-model.md](docs/research/combat-model.md) | Sistema de combate con fórmulas |
| [docs/research/mvp.md](docs/research/mvp.md) | Visión general del MVP |
| [docs/research/mvp-spec-v0.md](docs/research/mvp-spec-v0.md) | **Especificación técnica exacta MVP** |
| [docs/research/rebuild-plan.md](docs/research/rebuild-plan.md) | Stack técnico y fases de desarrollo |
| [docs/research/legal-safety.md](docs/research/legal-safety.md) | Guía de seguridad legal |
| [docs/research/glossary.md](docs/research/glossary.md) | Glosario ES/EN de términos |
| [docs/research/open-questions.md](docs/research/open-questions.md) | Dudas y decisiones pendientes |
| [docs/research/implementation-roadmap.md](docs/research/implementation-roadmap.md) | **Roadmap semana a semana** |
| [docs/research/agent-next-tasks.md](docs/research/agent-next-tasks.md) | **Tareas listas para desarrollo** |

---

## 🎮 Visión

Crear un MMO de estrategia espacial moderno, accesible y divertido, con:

- Core loop adictivo de construcción-expansión-combate
- Sistema de combate táctico por turnos
- Progresión significativa a largo plazo
- Comunidad activa y competitiva
- Multiplataforma (web, mobile)

---

## 🏗️ Estructura del Proyecto

```
GALAXY ONLINE III/
├── docs/
│   └── research/           # Documentación de investigación
├── apps/
│   ├── web/                # Frontend (Next.js)
│   └── api/                # Backend (Node.js)
├── packages/
│   ├── shared/             # Tipos y utilidades compartidas
│   ├── game-engine/        # Motor de combate
│   └── database/           # Schema Prisma
├── infra/
│   ├── docker/             # Docker configs
│   └── k8s/                # Kubernetes manifests
└── assets/
    ├── sprites/            # Arte 2D
    ├── audio/              # Música y SFX
    └── docs/               # Arte conceptual
```

---

## 🚀 Estado

**Fase**: Investigación y planificación completada.  
**Próximo**: Desarrollo del MVP.

Ver [docs/research/mvp.md](docs/research/mvp.md) para el roadmap detallado.

---

## 🛠️ Stack Tecnológico (Propuesto)

- **Frontend**: Next.js 14+, TypeScript, Tailwind CSS
- **Backend**: Node.js, Fastify, WebSockets
- **Database**: PostgreSQL + Redis
- **Queue**: BullMQ
- **Hosting**: Railway / Render / Fly.io

Ver [docs/research/rebuild-plan.md](docs/research/rebuild-plan.md) para detalles completos.

---

## 👥 Contribuir

Por ahora el proyecto está en fase inicial. Próximamente se abrirán canales de contribución.

---

## 🚀 Setup Desarrollo

### Requisitos
- Node.js 18+
- PostgreSQL 14+
- pnpm (recomendado)

### Instalación
```bash
# 1. Instalar dependencias
pnpm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de PostgreSQL

# 3. Setup base de datos
cd packages/database
npx prisma migrate dev --name init
npx prisma db seed

# 4. Iniciar desarrollo
# Terminal 1 - API
cd apps/api
pnpm dev

# Terminal 2 - Web
cd apps/web
pnpm dev
```

### Estructura del Creado
```
GALAXY ONLINE III/
├── apps/
│   ├── api/              # Fastify API
│   │   ├── src/
│   │   │   ├── routes/   # Auth, Empire, Planet
│   │   │   └── index.ts
│   │   └── package.json
│   └── web/              # Next.js 14
│       ├── src/app/      # Login, Dashboard
│       └── package.json
├── packages/
│   ├── database/         # Prisma schema + seed
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── seed.ts
│   │   └── src/index.ts
│   └── shared/           # Tipos compartidos
├── docs/
│   └── research/         # Documentación completa
└── README.md
```

---

**© 2026 Galaxy Online III Project. Todos los derechos reservados.**
